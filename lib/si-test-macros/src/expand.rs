use std::sync::Arc;

use proc_macro2::{Ident, Span, TokenStream, TokenTree};
use quote::quote;
use syn::{punctuated::Punctuated, token::Comma, Expr, ItemFn, ReturnType};

use crate::{
    Args, LOG_ENV_VAR, RT_DEFAULT_THREAD_STACK_SIZE, RT_DEFAULT_WORKER_THREADS, SPAN_EVENTS_ENV_VAR,
};

pub(crate) trait FnSetup {
    fn into_parts(self) -> (TokenStream, Punctuated<Expr, Comma>);
}

pub(crate) fn expand_test(item: ItemFn, _args: Args, fn_setup: impl FnSetup) -> TokenStream {
    if item.sig.asyncness.is_none() {
        panic!("test function must be async--blocking tests not supported");
    }

    let attrs = &item.attrs;
    let body = &item.block;
    let test_name = &item.sig.ident;
    let params = &item.sig.inputs;
    // Note that Rust doesn't allow a test function with `#[should_panic]` that has a non-unit
    // return value. Huh
    let (rt_is_result, output) = match &item.sig.output {
        ReturnType::Default => (false, quote! {}),
        ReturnType::Type(_, typeness) => (true, quote! {-> #typeness}),
    };
    let test_attr = quote! {#[::core::prelude::v1::test]};

    let thread_stack_size = RT_DEFAULT_THREAD_STACK_SIZE;

    let (fn_setups, fn_args) = fn_setup.into_parts();

    let fn_call = if rt_is_result {
        quote! {let _ = test_fn(#fn_args).await?;}
    } else {
        quote! {test_fn(#fn_args).await;}
    };
    let color_eyre_init = expand_color_eyre_init();
    let tracing_init = expand_tracing_init();
    let rt = expand_default_runtime();

    quote! {
        #test_attr
        #(#attrs)*
        fn #test_name() -> ::dal_test::Result<()> {
            use ::dal_test::WrapErr;

            async fn test_fn(#params) #output #body

            #[inline]
            async fn spawned_task() -> ::dal_test::Result<()> {
                #fn_setups
                #fn_call
                Ok(())
            }

            ::dal_test::COLOR_EYRE_INIT.call_once(|| {
                #color_eyre_init
                #tracing_init
            });

            let thread_builder = ::std::thread::Builder::new().stack_size(#thread_stack_size);
            let thread_join_handle = thread_builder.spawn(|| {
                #[allow(clippy::expect_used)]
                #rt.block_on(spawned_task())
            }).expect("failed to spawn thread at OS level");
            let test_result = match thread_join_handle.join() {
                Ok(r) => r,
                Err(err) => {
                    // Spawned test task panicked
                    ::std::panic::resume_unwind(err);
                }
            };
            let _ = test_result?;

            Ok(())
        }
    }
}

pub(crate) fn expand_color_eyre_init() -> TokenStream {
    quote! {
        ::dal_test::color_eyre::config::HookBuilder::default()
            .add_frame_filter(Box::new(|frames| {
                let mut displayed = ::std::collections::HashSet::new();
                let filters = &[
                    "tokio::",
                    "<futures_util::",
                    "std::panic",
                    "test::run_test_in_process",
                    "core::ops::function::FnOnce::call_once",
                    "std::thread::local",
                    "<core::future::",
                    "<alloc::boxed::Box",
                    "<std::panic::AssertUnwindSafe",
                    "core::result::Result",
                    "<T as futures_util",
                    "<tracing_futures::Instrumented",
                    "test::assert_test_result",
                    "spandoc::",
                ];

                frames.retain(|frame| {
                    let loc = (frame.lineno, &frame.filename);
                    let inserted = displayed.insert(loc);

                    if !inserted {
                        return false;
                    }

                    !filters.iter().any(|f| {
                        let name = if let Some(name) = frame.name.as_ref() {
                            name.as_str()
                        } else {
                            return true;
                        };

                        name.starts_with(f)
                    })
                });
            }))
            .install()
            .unwrap();
    }
}

fn expand_tracing_init() -> TokenStream {
    let span_events_env_var = SPAN_EVENTS_ENV_VAR;
    let log_env_var = LOG_ENV_VAR;

    quote! {
        let event_filter = {
            use ::dal_test::tracing_subscriber::fmt::format::FmtSpan;

            match ::std::env::var(#span_events_env_var) {
                Ok(value) => {
                    value
                        .to_ascii_lowercase()
                        .split(",")
                        .map(|filter| match filter.trim() {
                            "new" => FmtSpan::NEW,
                            "enter" => FmtSpan::ENTER,
                            "exit" => FmtSpan::EXIT,
                            "close" => FmtSpan::CLOSE,
                            "active" => FmtSpan::ACTIVE,
                            "full" => FmtSpan::FULL,
                            _ => panic!(
                                "{}: {} must contain filters separated by `,`.\n\t\
                                For example: `active` or `new,close`\n\t
                                Got: {}",
                                concat!(env!("CARGO_PKG_NAME"), "::dal_test"),
                                #span_events_env_var,
                                value,
                            ),
                        })
                        .fold(FmtSpan::NONE, |acc, filter| filter | acc)
                },
                Err(::std::env::VarError::NotUnicode(_)) => {
                    panic!(
                        "{}: {} must contain a valid UTF-8 string",
                        concat!(env!("CARGO_PKG_NAME"), "::dal_test"),
                        #span_events_env_var,
                    )
                }
                Err(::std::env::VarError::NotPresent) => FmtSpan::NONE,
            }
        };

        let subscriber = ::dal_test::tracing_subscriber::FmtSubscriber::builder()
            .with_env_filter(::dal_test::tracing_subscriber::EnvFilter::from_env(#log_env_var))
            .with_span_events(event_filter)
            .with_test_writer()
            .pretty()
            .finish();
        let _ = ::dal_test::telemetry::tracing::subscriber::set_global_default(subscriber);
    }
}

fn expand_default_runtime() -> TokenStream {
    let worker_threads = RT_DEFAULT_WORKER_THREADS;
    let thread_stack_size = RT_DEFAULT_THREAD_STACK_SIZE;

    expand_runtime(worker_threads, thread_stack_size)
}

fn expand_runtime(worker_threads: usize, thread_stack_size: usize) -> TokenStream {
    quote! {
        ::tokio::runtime::Builder::new_multi_thread()
            .worker_threads(#worker_threads)
            .thread_stack_size(#thread_stack_size)
            .enable_all()
            .build()
            .expect("Failed building the Runtime")
    }
}

pub(crate) trait FnSetupExpander {
    fn code_extend<I: IntoIterator<Item = TokenTree>>(&mut self, stream: I);
    fn push_arg(&mut self, arg: Expr);

    fn test_context(&self) -> Option<&Arc<Ident>>;
    fn set_test_context(&mut self, value: Option<Arc<Ident>>);

    fn jwt_secret_key(&self) -> Option<&Arc<Ident>>;
    fn set_jwt_secret_key(&mut self, value: Option<Arc<Ident>>);

    fn nats_subject_prefix(&self) -> Option<&Arc<Ident>>;
    fn set_nats_subject_prefix(&mut self, value: Option<Arc<Ident>>);

    fn council_server(&self) -> Option<&Arc<Ident>>;
    fn set_council_server(&mut self, value: Option<Arc<Ident>>);

    fn start_council_server(&self) -> Option<()>;
    fn set_start_council_server(&mut self, value: Option<()>);

    fn veritech_server(&self) -> Option<&Arc<Ident>>;
    fn set_veritech_server(&mut self, value: Option<Arc<Ident>>);

    fn veritech_shutdown_handle(&self) -> Option<&Arc<Ident>>;
    fn set_veritech_shutdown_handle(&mut self, value: Option<Arc<Ident>>);

    fn start_veritech_server(&self) -> Option<()>;
    fn set_start_veritech_server(&mut self, value: Option<()>);

    fn services_context(&self) -> Option<&Arc<Ident>>;
    fn set_services_context(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_builder(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_builder(&mut self, value: Option<Arc<Ident>>);

    fn connections(&self) -> Option<&Arc<Ident>>;
    fn set_connections(&mut self, value: Option<Arc<Ident>>);

    fn owned_connections(&self) -> Option<&Arc<Ident>>;
    fn set_owned_connections(&mut self, value: Option<Arc<Ident>>);

    fn transactions(&self) -> Option<&Arc<Ident>>;
    fn set_transactions(&mut self, value: Option<Arc<Ident>>);

    fn workspace_signup(&self) -> Option<&(Arc<Ident>, Arc<Ident>)>;
    fn set_workspace_signup(&mut self, value: Option<(Arc<Ident>, Arc<Ident>)>);

    fn workspace_pk(&self) -> Option<&Arc<Ident>>;
    fn set_workspace_pk(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_default(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_default(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_default_mut(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_default_mut(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_head(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_head(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_head_ref(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_head_ref(&mut self, value: Option<Arc<Ident>>);

    fn dal_context_head_mut_ref(&self) -> Option<&Arc<Ident>>;
    fn set_dal_context_head_mut_ref(&mut self, value: Option<Arc<Ident>>);

    fn setup_test_context(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.test_context() {
            return ident.clone();
        }

        let var = Ident::new("test_context", Span::call_site());
        self.code_extend(quote! {
            let test_context = ::dal_test::TestContext::global().await?;
        });
        self.set_test_context(Some(Arc::new(var)));

        self.test_context().unwrap().clone()
    }

    fn setup_jwt_secret_key(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.jwt_secret_key() {
            return ident.clone();
        }

        let test_context = self.setup_test_context();
        let test_context = test_context.as_ref();

        let var = Ident::new("jwt_secret_key", Span::call_site());
        self.code_extend(quote! {
            let #var = #test_context.jwt_secret_key();
        });
        self.set_jwt_secret_key(Some(Arc::new(var)));

        self.jwt_secret_key().unwrap().clone()
    }

    fn setup_nats_subject_prefix(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.nats_subject_prefix() {
            return ident.clone();
        }

        let var = Ident::new("nats_subject_prefix", Span::call_site());
        self.code_extend(quote! {
            let #var = ::dal_test::nats_subject_prefix();
        });
        self.set_nats_subject_prefix(Some(Arc::new(var)));

        self.nats_subject_prefix().unwrap().clone()
    }

    fn setup_council_server(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.council_server() {
            return ident.clone();
        }

        let test_context = self.setup_test_context();
        let test_context = test_context.as_ref();
        let nats_subject_prefix = self.setup_nats_subject_prefix();
        let nats_subject_prefix = nats_subject_prefix.as_ref();

        let var = Ident::new("council_server", Span::call_site());
        self.code_extend(quote! {
            let #var = ::dal_test::council_server(
                #test_context.nats_config().clone(),
                format!("{}.council", #nats_subject_prefix),
            ).await?;
        });
        self.set_council_server(Some(Arc::new(var)));

        self.council_server().unwrap().clone()
    }

    fn setup_start_council_server(&mut self) {
        if self.start_council_server().is_some() {
            return;
        }

        let council_server = self.setup_council_server();
        let council_server = council_server.as_ref();

        self.code_extend(quote! {
            {
                let (_, shutdown_request_rx) = ::tokio::sync::watch::channel(());
                let (
                    subscription_started_tx,
                    mut subscription_started_rx
                ) = ::tokio::sync::watch::channel(());
                ::tokio::spawn(#council_server.run(subscription_started_tx, shutdown_request_rx));
                subscription_started_rx.changed().await.unwrap()
            }
        });
        self.set_start_council_server(Some(()));
    }

    fn setup_veritech_server(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.veritech_server() {
            return ident.clone();
        }

        let test_context = self.setup_test_context();
        let test_context = test_context.as_ref();
        let nats_subject_prefix = self.setup_nats_subject_prefix();
        let nats_subject_prefix = nats_subject_prefix.as_ref();

        let var = Ident::new("veritech_server", Span::call_site());
        self.code_extend(quote! {
            let #var = ::dal_test::veritech_server_for_uds_cyclone(
                #test_context.nats_config().clone(),
                format!("{}.veritech", #nats_subject_prefix),
            ).await?;
        });
        self.set_veritech_server(Some(Arc::new(var)));

        self.veritech_server().unwrap().clone()
    }

    fn setup_veritech_shutdown_handle(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.veritech_shutdown_handle() {
            return ident.clone();
        }

        let veritech_server = self.setup_veritech_server();
        let veritech_server = veritech_server.as_ref();

        let var = Ident::new("veritech_shutdown_handle", Span::call_site());
        self.code_extend(quote! {
            let #var = #veritech_server.shutdown_handle();
        });
        self.set_veritech_shutdown_handle(Some(Arc::new(var)));

        self.veritech_shutdown_handle().unwrap().clone()
    }

    fn setup_start_veritech_server(&mut self) {
        if self.start_veritech_server().is_some() {
            return;
        }

        let veritech_server = self.setup_veritech_server();
        let veritech_server = veritech_server.as_ref();

        self.code_extend(quote! {
            ::tokio::spawn(#veritech_server.run());
        });
        self.set_start_veritech_server(Some(()));
    }

    fn setup_services_context(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.services_context() {
            return ident.clone();
        }

        let test_context = self.setup_test_context();
        let test_context = test_context.as_ref();
        let nats_subject_prefix = self.setup_nats_subject_prefix();
        let nats_subject_prefix = nats_subject_prefix.as_ref();

        let var = Ident::new("services_context", Span::call_site());
        self.code_extend(quote! {
            let #var = #test_context.create_services_context(&#nats_subject_prefix).await;
        });
        self.set_services_context(Some(Arc::new(var)));

        self.services_context().unwrap().clone()
    }

    fn setup_dal_context_builder(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_builder() {
            return ident.clone();
        }

        let services_context = self.setup_services_context();
        let services_context = services_context.as_ref();

        let var = Ident::new("dal_context_builder", Span::call_site());
        self.code_extend(quote! {
            let #var = #services_context.into_builder();
        });
        self.set_dal_context_builder(Some(Arc::new(var)));

        self.dal_context_builder().unwrap().clone()
    }

    fn setup_connections(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.connections() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();

        let var = Ident::new("connections", Span::call_site());
        self.code_extend(quote! {
            let mut #var = #dal_context_builder
                .connections()
                .await
                .wrap_err("failed to build connections")?;
        });
        self.set_connections(Some(Arc::new(var)));

        self.connections().unwrap().clone()
    }

    fn setup_owned_connections(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.owned_connections() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();

        let var = Ident::new("owned_connections", Span::call_site());
        self.code_extend(quote! {
            let #var = #dal_context_builder
                .connections()
                .await
                .wrap_err("failed to build connections")?;
        });
        self.set_owned_connections(Some(Arc::new(var)));

        self.owned_connections().unwrap().clone()
    }

    fn setup_transactions(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.transactions() {
            return ident.clone();
        }

        let connections = self.setup_connections();
        let connections = connections.as_ref();

        let var = Ident::new("transactions", Span::call_site());
        self.code_extend(quote! {
            let mut #var = #connections
                .start_txns()
                .await
                .wrap_err("failed to start transactions")?;
        });
        self.set_transactions(Some(Arc::new(var)));

        self.transactions().unwrap().clone()
    }

    fn setup_workspace_signup(&mut self) -> (Arc<Ident>, Arc<Ident>) {
        if let Some(idents) = self.workspace_signup() {
            return idents.clone();
        }

        let test_context = self.setup_test_context();
        let test_context = test_context.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();

        let var_nw = Ident::new("nw", Span::call_site());
        let var_auth_token = Ident::new("auth_token", Span::call_site());
        self.code_extend(quote! {
            let (#var_nw, #var_auth_token) = {
                let ctx = #dal_context_builder.build_default_with_txns(#transactions);
                let r = ::dal_test::helpers::workspace_signup(
                    &ctx,
                    #test_context.jwt_secret_key(),
                ).await?;
                #transactions = ctx.into();
                r
            };
        });
        self.set_workspace_signup(Some((Arc::new(var_nw), Arc::new(var_auth_token))));

        self.workspace_signup().unwrap().clone()
    }

    fn setup_workspace_pk(&mut self) -> Arc<Ident> {
        if let Some(idents) = self.workspace_pk() {
            return idents.clone();
        }

        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("nw_workspace_pk", Span::call_site());
        self.code_extend(quote! {
            let #var = *#nw.workspace.pk();
        });
        self.set_workspace_pk(Some(Arc::new(var)));

        self.workspace_pk().unwrap().clone()
    }

    fn setup_dal_context_default(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_default() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("default_dal_context", Span::call_site());
        self.code_extend(quote! {
            let #var = {
                let mut ctx = #dal_context_builder.build_default_with_txns(#transactions.clone());
                ctx.update_tenancy(::dal::Tenancy::new(*#nw.workspace.pk()));
                ::dal_test::helpers::create_change_set_and_update_ctx(&mut ctx).await;
                ctx
            };
        });
        self.set_dal_context_default(Some(Arc::new(var)));

        self.dal_context_default().unwrap().clone()
    }

    fn setup_dal_context_default_mut(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_default_mut() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("dal_context_default_mut", Span::call_site());
        self.code_extend(quote! {
            let mut #var = {
                let mut ctx = #dal_context_builder.build_default_with_txns(#transactions.clone());
                ctx.update_tenancy(::dal::Tenancy::new(*#nw.workspace.pk()));
                ::dal_test::helpers::create_change_set_and_update_ctx(&mut ctx).await;
                ctx
            };
        });
        self.set_dal_context_default_mut(Some(Arc::new(var)));

        self.dal_context_default_mut().unwrap().clone()
    }

    fn setup_dal_context_head(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_head() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("dal_context_head", Span::call_site());
        self.code_extend(quote! {
            let #var = {
                let mut ctx = #dal_context_builder
                    .build_with_txns(
                        ::dal::RequestContext::default(),
                        #transactions.clone(),
                    );
                ctx.update_tenancy(::dal::Tenancy::new(*#nw.workspace.pk()));

                ::dal_test::DalContextHead(ctx)
            };
        });
        self.set_dal_context_head(Some(Arc::new(var)));

        self.dal_context_head().unwrap().clone()
    }

    fn setup_dal_context_head_ref(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_head_ref() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("dal_context_head_ref", Span::call_site());
        self.code_extend(quote! {
            let _dchr = {
                let mut ctx = #dal_context_builder
                    .build_with_txns(
                        ::dal::RequestContext::default(),
                        #transactions.clone(),
                    );
                ctx.update_tenancy(::dal::Tenancy::new(*#nw.workspace.pk()));
                ctx
            };
            let #var = ::dal_test::DalContextHeadRef(&_dchr);
        });
        self.set_dal_context_head_ref(Some(Arc::new(var)));

        self.dal_context_head_ref().unwrap().clone()
    }

    fn setup_dal_context_head_mut_ref(&mut self) -> Arc<Ident> {
        if let Some(ident) = self.dal_context_head_mut_ref() {
            return ident.clone();
        }

        let dal_context_builder = self.setup_dal_context_builder();
        let dal_context_builder = dal_context_builder.as_ref();
        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();
        let bas = self.setup_workspace_signup();
        let nw = bas.0.as_ref();

        let var = Ident::new("dal_context_head_mut_ref", Span::call_site());
        self.code_extend(quote! {
            let mut _dchmr = {
                let mut ctx = #dal_context_builder
                    .build_with_txns(
                        ::dal::RequestContext::default(),
                        #transactions.clone(),
                    );
                ctx.update_tenancy(::dal::Tenancy::new(*#nw.workspace.pk()));
                ctx
            };
            let #var = ::dal_test::DalContextHeadMutRef(&mut _dchmr);
        });
        self.set_dal_context_head_mut_ref(Some(Arc::new(var)));

        self.dal_context_head_mut_ref().unwrap().clone()
    }

    fn drop_transactions_clone_if_created(&mut self) {
        if !self.has_transactions() {
            return;
        }

        let transactions = self.setup_transactions();
        let transactions = transactions.as_ref();

        self.code_extend(quote! {
            // Drop remaining clone so that no copies of the transaction can outlive a commit or
            // rollback
            drop(#transactions);
        });
    }

    fn has_transactions(&self) -> bool {
        self.transactions().is_some()
    }
}