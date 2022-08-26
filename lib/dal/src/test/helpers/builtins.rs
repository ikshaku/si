//! This module provides [`BuiltinsHarness`], for use in integration tests related to
//! providers and builtin [`Schemas`](crate::Schema) leveraging them.

use std::collections::HashMap;

use crate::test::helpers::{
    find_prop_and_parent_by_name, find_schema_and_default_variant_by_name, ComponentPayload,
};
use crate::{
    AttributeReadContext, Component, DalContext, PropId, SchemaId, SchemaVariantId, StandardModel,
};

/// This harness provides methods to create [`Components`](crate::Component) from builtin
/// [`Schemas`](crate::Schema). All fields are private since they are purely used to reduce the
/// number of total database queries.
#[derive(Default)]
pub struct BuiltinsHarness {
    docker_hub_credential_schema_id: Option<SchemaId>,
    docker_hub_credential_schema_variant_id: Option<SchemaVariantId>,
    docker_hub_credential_prop_map: HashMap<&'static str, PropId>,

    docker_image_schema_id: Option<SchemaId>,
    docker_image_schema_variant_id: Option<SchemaVariantId>,
    docker_image_prop_map: HashMap<&'static str, PropId>,

    kubernetes_namespace_schema_id: Option<SchemaId>,
    kubernetes_namespace_schema_variant_id: Option<SchemaVariantId>,
    kubernetes_namespace_prop_map: HashMap<&'static str, PropId>,

    kubernetes_deployment_schema_id: Option<SchemaId>,
    kubernetes_deployment_schema_variant_id: Option<SchemaVariantId>,
    kubernetes_deployment_prop_map: HashMap<&'static str, PropId>,
}

// TODO(nick): make these functions and the core struct generic. I started doing this by creating
// a "Builtin" struct with a schema variant id, schema id, and prop map, but stopped because
// we need to make prop map collection generic as well. That may be difficult because the props
// differ between each builtin schema. For example: kubernetes deployment has a containers array,
// but docker image does not. Thus, we would need to find a way to either pass through complex
// arguments or pass prop map collection to the user (probably the latter). For now, let's keep
// adding builtins by hand.
impl BuiltinsHarness {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn create_docker_hub_credential(
        &mut self,
        ctx: &DalContext<'_, '_>,
        name: impl AsRef<str>,
    ) -> ComponentPayload {
        let (schema_id, schema_variant_id) = match (
            self.docker_hub_credential_schema_id,
            self.docker_hub_credential_schema_variant_id,
        ) {
            (Some(schema_id), Some(schema_variant_id)) => (schema_id, schema_variant_id),
            (_, _) => {
                // Save them for next time!
                let (schema, schema_variant) =
                    find_schema_and_default_variant_by_name(ctx, "docker_hub_credential").await;
                let (schema_id, schema_variant_id) = (*schema.id(), *schema_variant.id());
                self.docker_hub_credential_schema_id = Some(schema_id);
                self.docker_hub_credential_schema_variant_id = Some(schema_variant_id);
                (schema_id, schema_variant_id)
            }
        };

        // Add props that you would like to access here! We'll save them if other components
        // are created in addition to the first one.
        if self.docker_hub_credential_prop_map.is_empty() {
            let (name_prop_id, _) =
                find_prop_and_parent_by_name(ctx, "name", "si", None, schema_variant_id)
                    .await
                    .expect("could not find prop and/or parent");
            self.docker_hub_credential_prop_map
                .insert("/root/si/name", name_prop_id);
        }

        Self::create_component_from_schema(
            ctx,
            schema_id,
            schema_variant_id,
            self.docker_hub_credential_prop_map.clone(),
            name,
        )
        .await
    }

    pub async fn create_docker_image(
        &mut self,
        ctx: &DalContext<'_, '_>,
        name: impl AsRef<str>,
    ) -> ComponentPayload {
        let (schema_id, schema_variant_id) = match (
            self.docker_image_schema_id,
            self.docker_image_schema_variant_id,
        ) {
            (Some(schema_id), Some(schema_variant_id)) => (schema_id, schema_variant_id),
            (_, _) => {
                // Save them for next time!
                let (schema, schema_variant) =
                    find_schema_and_default_variant_by_name(ctx, "docker_image").await;
                let (schema_id, schema_variant_id) = (*schema.id(), *schema_variant.id());
                self.docker_image_schema_id = Some(schema_id);
                self.docker_image_schema_variant_id = Some(schema_variant_id);
                (schema_id, schema_variant_id)
            }
        };

        // Add props that you would like to access here! We'll save them if other components
        // are created in addition to the first one.
        if self.docker_image_prop_map.is_empty() {
            let (name_prop_id, _) =
                find_prop_and_parent_by_name(ctx, "name", "si", None, schema_variant_id)
                    .await
                    .expect("could not find prop and/or parent");
            self.docker_image_prop_map
                .insert("/root/si/name", name_prop_id);
        }

        Self::create_component_from_schema(
            ctx,
            schema_id,
            schema_variant_id,
            self.docker_image_prop_map.clone(),
            name,
        )
        .await
    }

    pub async fn create_kubernetes_namespace(
        &mut self,
        ctx: &DalContext<'_, '_>,
        name: impl AsRef<str>,
    ) -> ComponentPayload {
        let (schema_id, schema_variant_id) = match (
            self.kubernetes_namespace_schema_id,
            self.kubernetes_namespace_schema_variant_id,
        ) {
            (Some(schema_id), Some(schema_variant_id)) => (schema_id, schema_variant_id),
            (_, _) => {
                // Save them for next time!
                let (schema, schema_variant) =
                    find_schema_and_default_variant_by_name(ctx, "kubernetes_namespace").await;
                let (schema_id, schema_variant_id) = (*schema.id(), *schema_variant.id());
                self.kubernetes_namespace_schema_id = Some(schema_id);
                self.kubernetes_namespace_schema_variant_id = Some(schema_variant_id);
                (schema_id, schema_variant_id)
            }
        };

        // Add props that you would like to access here! We'll save them if other components
        // are created in addition to the first one.
        if self.kubernetes_namespace_prop_map.is_empty() {
            let (metadata_name_prop_id, _) =
                find_prop_and_parent_by_name(ctx, "name", "metadata", None, schema_variant_id)
                    .await
                    .expect("could not find prop and/or parent");
            self.kubernetes_namespace_prop_map
                .insert("/root/si/metadata/name", metadata_name_prop_id);

            let (si_name_prop_id, _) =
                find_prop_and_parent_by_name(ctx, "name", "si", None, schema_variant_id)
                    .await
                    .expect("could not find prop and/or parent");
            self.kubernetes_namespace_prop_map
                .insert("/root/si/name", si_name_prop_id);
        }

        Self::create_component_from_schema(
            ctx,
            schema_id,
            schema_variant_id,
            self.kubernetes_namespace_prop_map.clone(),
            name,
        )
        .await
    }

    pub async fn create_kubernetes_deployment(
        &mut self,
        ctx: &DalContext<'_, '_>,
        name: impl AsRef<str>,
    ) -> ComponentPayload {
        let (schema_id, schema_variant_id) = match (
            self.kubernetes_deployment_schema_id,
            self.kubernetes_deployment_schema_variant_id,
        ) {
            (Some(schema_id), Some(schema_variant_id)) => (schema_id, schema_variant_id),
            (_, _) => {
                // Save them for next time!
                let (schema, schema_variant) =
                    find_schema_and_default_variant_by_name(ctx, "kubernetes_deployment").await;
                let (schema_id, schema_variant_id) = (*schema.id(), *schema_variant.id());
                self.kubernetes_deployment_schema_id = Some(schema_id);
                self.kubernetes_deployment_schema_variant_id = Some(schema_variant_id);
                (schema_id, schema_variant_id)
            }
        };

        // Add props that you would like to access here! We'll save them if other components
        // are created in addition to the first one.
        if self.kubernetes_deployment_prop_map.is_empty() {
            let (name_prop_id, _) =
                find_prop_and_parent_by_name(ctx, "name", "si", None, schema_variant_id)
                    .await
                    .expect("could not find prop and/or parent");
            self.kubernetes_deployment_prop_map
                .insert("/root/si/name", name_prop_id);
        }

        Self::create_component_from_schema(
            ctx,
            schema_id,
            schema_variant_id,
            self.kubernetes_deployment_prop_map.clone(),
            name,
        )
        .await
    }

    async fn create_component_from_schema(
        ctx: &DalContext<'_, '_>,
        schema_id: SchemaId,
        schema_variant_id: SchemaVariantId,
        prop_map: HashMap<&'static str, PropId>,
        name: impl AsRef<str>,
    ) -> ComponentPayload {
        let (component, node) = Component::new_for_schema_with_node(ctx, name, &schema_id)
            .await
            .expect("unable to create component");

        ComponentPayload {
            schema_id,
            schema_variant_id,
            component_id: *component.id(),
            prop_map,
            node,
            base_attribute_read_context: AttributeReadContext {
                prop_id: None,
                schema_id: Some(schema_id),
                schema_variant_id: Some(schema_variant_id),
                component_id: Some(*component.id()),
                ..AttributeReadContext::default()
            },
        }
    }
}