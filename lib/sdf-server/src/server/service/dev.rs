use crate::server::state::AppState;
use crate::service::dev::create_builtin_func::create_builtin_func;
use crate::service::dev::save_builtin_func::save_builtin_func;
use crate::service::func;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Json;
use axum::Router;
use dal::{StandardModelError, TransactionsError, UserError, WsEventError};
use thiserror::Error;

mod create_builtin_func;
mod get_current_git_sha;
mod save_builtin_func;

#[derive(Debug, Error)]
#[allow(clippy::large_enum_variant)]
pub enum DevError {
    #[error(transparent)]
    Nats(#[from] si_data_nats::NatsError),
    #[error(transparent)]
    Pg(#[from] si_data_pg::PgError),
    #[error(transparent)]
    ContextTransaction(#[from] TransactionsError),
    #[error("user error: {0}")]
    User(#[from] UserError),
    #[error("Function not found")]
    FuncNotFound,
    #[error(transparent)]
    StandardModel(#[from] StandardModelError),
    #[error("could not publish websocket event: {0}")]
    WsEvent(#[from] WsEventError),
    #[error(transparent)]
    Func(#[from] dal::FuncError),
    #[error(transparent)]
    SdfFunc(#[from] func::FuncError),
    #[error(transparent)]
    Builtin(#[from] dal::BuiltinsError),
}

pub type DevResult<T> = Result<T, DevError>;

impl IntoResponse for DevError {
    fn into_response(self) -> Response {
        let (status, error_message) = (StatusCode::INTERNAL_SERVER_ERROR, self.to_string());

        let body = Json(serde_json::json!({
            "error": {
                "message": error_message,
                "code": 42,
                "statusCode": status.as_u16(),
            },
        }));

        (status, body).into_response()
    }
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/get_current_git_sha",
            get(get_current_git_sha::get_current_git_sha),
        )
        .route("/save_func", post(save_builtin_func))
        .route("/create_func", post(create_builtin_func))
}