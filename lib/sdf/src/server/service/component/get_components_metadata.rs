use axum::extract::Query;
use axum::Json;
use dal::{
    resource::ResourceHealth, system::UNSET_SYSTEM_ID, Component, ComponentId, StandardModel,
    SystemId, Visibility, WorkspaceId,
};
use serde::{Deserialize, Serialize};

use super::{ComponentError, ComponentResult};
use crate::server::extract::{AccessBuilder, HandlerContext};

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GetComponentsMetadataRequest {
    pub system_id: Option<SystemId>,
    pub workspace_id: WorkspaceId,
    #[serde(flatten)]
    pub visibility: Visibility,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ComponentMetadata {
    pub schema_name: String,
    pub qualified: Option<bool>,
    pub resource_health: Option<ResourceHealth>,
    pub component_id: ComponentId,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GetComponentsMetadataResponse {
    pub data: Vec<ComponentMetadata>,
}

pub async fn get_components_metadata(
    HandlerContext(builder, mut txns): HandlerContext,
    AccessBuilder(request_ctx): AccessBuilder,
    Query(request): Query<GetComponentsMetadataRequest>,
) -> ComponentResult<Json<GetComponentsMetadataResponse>> {
    let txns = txns.start().await?;
    let ctx = builder.build(request_ctx.build(request.visibility), &txns);

    let system_id = request.system_id.unwrap_or(UNSET_SYSTEM_ID);

    let components = Component::list(&ctx).await?;
    let mut metadata = Vec::with_capacity(components.len());

    // Note: this is slow, we should have a better way of doing this
    for component in components {
        // TODO: we have to filter the components here, by system and application

        let schema = component
            .schema_with_tenancy(&ctx)
            .await?
            .ok_or(ComponentError::SchemaNotFound)?;

        let qualifications =
            Component::list_qualifications_by_component_id(&ctx, *component.id(), system_id)
                .await?;

        let qualified = qualifications
            .into_iter()
            .flat_map(|q| q.result.map(|r| r.success))
            .reduce(|q, acc| acc && q);

        let resource =
            Component::get_resource_by_component_and_system(&ctx, *component.id(), system_id)
                .await?;

        metadata.push(ComponentMetadata {
            schema_name: schema.name().to_owned(),
            qualified,
            resource_health: resource.map(|r| r.health),
            component_id: *component.id(),
        });
    }
    Ok(Json(GetComponentsMetadataResponse { data: metadata }))
}