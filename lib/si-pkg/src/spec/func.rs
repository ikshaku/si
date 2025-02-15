use base64::{engine::general_purpose, Engine};
use derive_builder::Builder;
use object_tree::Hash;
use serde::{Deserialize, Serialize};
use strum::{AsRefStr, Display, EnumIter, EnumString};
use url::Url;

use super::SpecError;

#[remain::sorted]
#[derive(
    Deserialize,
    Serialize,
    AsRefStr,
    Display,
    EnumIter,
    EnumString,
    Debug,
    Clone,
    Copy,
    PartialEq,
    Eq,
)]
#[serde(rename_all = "camelCase")]
pub enum FuncArgumentKind {
    Any,
    Array,
    Boolean,
    Integer,
    Map,
    Object,
    String,
}

#[derive(Builder, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[builder(build_fn(error = "SpecError"))]
pub struct FuncArgumentSpec {
    #[builder(setter(into))]
    pub name: String,
    #[builder(setter(into))]
    pub kind: FuncArgumentKind,
    #[builder(setter(into), default)]
    pub element_kind: Option<FuncArgumentKind>,
}

impl FuncArgumentSpec {
    pub fn builder() -> FuncArgumentSpecBuilder {
        FuncArgumentSpecBuilder::default()
    }
}

#[remain::sorted]
#[derive(Clone, Copy, Debug, Deserialize, Serialize, AsRefStr, Display, EnumIter, EnumString)]
#[serde(rename_all = "camelCase")]
pub enum FuncSpecBackendKind {
    Array,
    Boolean,
    Diff,
    Identity,
    Integer,
    JsAction,
    JsAttribute,
    JsReconciliation,
    JsSchemaVariantDefinition,
    JsValidation,
    Map,
    Object,
    String,
    Unset,
    Validation,
}

#[remain::sorted]
#[derive(Clone, Copy, Debug, Deserialize, Serialize, AsRefStr, Display, EnumIter, EnumString)]
#[serde(rename_all = "camelCase")]
pub enum FuncSpecBackendResponseType {
    Action,
    Array,
    Boolean,
    CodeGeneration,
    Confirmation,
    Identity,
    Integer,
    Json,
    Map,
    Object,
    Qualification,
    Reconciliation,
    SchemaVariantDefinition,
    String,
    Unset,
    Validation,
}

pub type FuncUniqueId = Hash;

#[derive(Builder, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[builder(build_fn(error = "SpecError"))]
pub struct FuncSpec {
    #[builder(setter(into))]
    pub name: String,
    #[builder(setter(into, strip_option), default)]
    pub display_name: Option<String>,
    #[builder(setter(into, strip_option), default)]
    pub description: Option<String>,
    #[builder(setter(into))]
    pub handler: String,
    #[builder(setter(into))]
    pub code_base64: String,
    #[builder(setter(into))]
    pub backend_kind: FuncSpecBackendKind,
    #[builder(setter(into))]
    pub response_type: FuncSpecBackendResponseType,
    #[builder(setter(into), default)]
    pub hidden: bool,
    #[builder(field(type = "FuncUniqueId", build = "self.build_func_unique_id()"))]
    pub unique_id: FuncUniqueId,

    #[builder(setter(into, strip_option), default)]
    pub link: Option<Url>,

    #[builder(setter(each(name = "argument"), into), default)]
    pub arguments: Vec<FuncArgumentSpec>,
}

impl FuncSpec {
    #[must_use]
    pub fn builder() -> FuncSpecBuilder {
        FuncSpecBuilder::default()
    }
}

impl FuncSpecBuilder {
    #[allow(unused_mut)]
    pub fn try_link<V>(&mut self, value: V) -> Result<&mut Self, V::Error>
    where
        V: TryInto<Url>,
    {
        let converted: Url = value.try_into()?;
        Ok(self.link(converted))
    }

    pub fn code_plaintext(&mut self, code: impl Into<String>) -> &mut Self {
        let code_plaintext = code.into();
        self.code_base64(general_purpose::STANDARD_NO_PAD.encode(code_plaintext))
    }

    fn build_func_unique_id(&self) -> Hash {
        // Not happy about all these clones and unwraps...
        let mut bytes = vec![];
        bytes.extend(self.name.clone().unwrap_or("".to_string()).as_bytes());
        bytes.extend(
            self.display_name
                .clone()
                .unwrap_or(Some("".to_string()))
                .unwrap_or("".to_string())
                .as_bytes(),
        );
        bytes.extend(
            self.description
                .clone()
                .unwrap_or(Some("".to_string()))
                .unwrap_or("".to_string())
                .as_bytes(),
        );
        bytes.extend(self.handler.clone().unwrap_or("".to_string()).as_bytes());
        bytes.extend(
            self.code_base64
                .clone()
                .unwrap_or("".to_string())
                .as_bytes(),
        );
        bytes.extend(
            self.backend_kind
                .unwrap_or(FuncSpecBackendKind::JsAttribute)
                .to_string()
                .as_bytes(),
        );
        bytes.extend(
            self.response_type
                .unwrap_or(FuncSpecBackendResponseType::Object)
                .to_string()
                .as_bytes(),
        );
        bytes.extend(&[self.hidden.unwrap_or(false).into()]);

        Hash::new(&bytes)
    }
}
