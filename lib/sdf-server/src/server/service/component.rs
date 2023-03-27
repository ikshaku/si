use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use dal::change_status::ChangeStatusError;
use dal::{
    node::NodeError, property_editor::PropertyEditorError, AttributeContextBuilderError,
    AttributePrototypeArgumentError, AttributePrototypeError, AttributeValueError,
    ComponentError as DalComponentError, ComponentId, DiagramError, ExternalProviderError,
    FuncBindingError, InternalProviderError, SchemaError as DalSchemaError, StandardModelError,
    TransactionsError, WsEventError,
};
use thiserror::Error;

use crate::{server::state::AppState, service::schema::SchemaError};

pub mod get_code;
pub mod get_components_metadata;
pub mod get_diff;
pub mod get_property_editor_schema;
pub mod get_property_editor_validations;
pub mod get_property_editor_values;
pub mod insert_property_editor_value;
pub mod list_qualifications;
pub mod set_type;
pub mod update_property_editor_value;

#[derive(Debug, Error)]
pub enum ComponentError {
    #[error("attribute value error: {0}")]
    AttributeValue(#[from] AttributeValueError),
    #[error("component error: {0}")]
    Component(#[from] DalComponentError),
    #[error("component name not found")]
    ComponentNameNotFound,
    #[error("component not found for id: {0}")]
    ComponentNotFound(ComponentId),
    #[error("dal schema error: {0}")]
    DalSchema(#[from] DalSchemaError),
    #[error("invalid request")]
    InvalidRequest,
    #[error(transparent)]
    Nats(#[from] si_data_nats::NatsError),
    #[error(transparent)]
    Pg(#[from] si_data_pg::PgError),
    #[error("node error: {0}")]
    Node(#[from] NodeError),
    #[error("diagram error: {0}")]
    Diagram(#[from] DiagramError),
    #[error("serde json error: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("attribute prototype argument error: {0}")]
    AttributePrototypeArgument(#[from] AttributePrototypeArgumentError),
    #[error("attribute prototype error: {0}")]
    AttributePrototype(#[from] AttributePrototypeError),
    #[error("attribute context builder error: {0}")]
    AttributeContextBuilder(#[from] AttributeContextBuilderError),
    #[error("external provider error: {0}")]
    ExternalProvider(#[from] ExternalProviderError),
    #[error("func binding error: {0}")]
    FuncBinding(#[from] FuncBindingError),
    #[error("internal provider error: {0}")]
    InternalProvider(#[from] InternalProviderError),
    #[error("identity func not found")]
    IdentityFuncNotFound,
    #[error("attribute value not found")]
    AttributeValueNotFound,
    #[error("attribute prototype not found")]
    AttributePrototypeNotFound,
    #[error("change status error: {0}")]
    ChangeStatus(#[from] ChangeStatusError),
    #[error("schema error: {0}")]
    Schema(#[from] SchemaError),
    #[error("schema not found")]
    SchemaNotFound,
    #[error("schema variant not found")]
    SchemaVariantNotFound,
    #[error(transparent)]
    StandardModel(#[from] StandardModelError),
    #[error("system id is required: ident_nil_v1() was provided")]
    SystemIdRequired,
    #[error(transparent)]
    Transactions(#[from] TransactionsError),
    #[error("ws event error: {0}")]
    WsEvent(#[from] WsEventError),
    #[error("invalid visibility")]
    InvalidVisibility,
    #[error("property editor error: {0}")]
    PropertyEditor(#[from] PropertyEditorError),
}

pub type ComponentResult<T> = std::result::Result<T, ComponentError>;

impl IntoResponse for ComponentError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            ComponentError::SchemaNotFound => (StatusCode::NOT_FOUND, self.to_string()),
            ComponentError::InvalidVisibility => (StatusCode::NOT_FOUND, self.to_string()),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };

        let body = Json(
            serde_json::json!({ "error": { "message": error_message, "code": 42, "statusCode": status.as_u16() } }),
        );

        (status, body).into_response()
    }
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/get_components_metadata",
            get(get_components_metadata::get_components_metadata),
        )
        .route(
            "/list_qualifications",
            get(list_qualifications::list_qualifications),
        )
        .route("/get_code", get(get_code::get_code))
        .route("/get_diff", get(get_diff::get_diff))
        .route(
            "/get_property_editor_schema",
            get(get_property_editor_schema::get_property_editor_schema),
        )
        .route(
            "/get_property_editor_values",
            get(get_property_editor_values::get_property_editor_values),
        )
        .route(
            "/update_property_editor_value",
            post(update_property_editor_value::update_property_editor_value),
        )
        .route(
            "/insert_property_editor_value",
            post(insert_property_editor_value::insert_property_editor_value),
        )
        .route(
            "/get_property_editor_validations",
            get(get_property_editor_validations::get_property_editor_validations),
        )
        .route("/set_type", post(set_type::set_type))
}