use si_data::{NatsTxn, PgTxn};

use crate::{
    Func, FuncBackendKind, FuncBackendResponseType, FuncResult, HistoryActor, StandardModel,
    Tenancy, Visibility,
};

pub async fn migrate(txn: &PgTxn<'_>, nats: &NatsTxn) -> FuncResult<()> {
    let (tenancy, visibility, history_actor) = (
        Tenancy::new_universal(),
        Visibility::new_head(false),
        HistoryActor::SystemInit,
    );

    si_set_string(txn, nats, &tenancy, &visibility, &history_actor).await?;
    si_unset(txn, nats, &tenancy, &visibility, &history_actor).await?;

    Ok(())
}

async fn si_set_string(
    txn: &PgTxn<'_>,
    nats: &NatsTxn,
    tenancy: &Tenancy,
    visibility: &Visibility,
    history_actor: &HistoryActor,
) -> FuncResult<()> {
    let existing_func = Func::find_by_attr(
        txn,
        tenancy,
        visibility,
        "name",
        &"si:setString".to_string(),
    )
    .await?;
    if existing_func.is_empty() {
        Func::new(
            txn,
            nats,
            tenancy,
            visibility,
            history_actor,
            "si:setString",
            FuncBackendKind::String,
            FuncBackendResponseType::String,
        )
        .await
        .expect("cannot create func");
    }
    Ok(())
}

async fn si_unset(
    txn: &PgTxn<'_>,
    nats: &NatsTxn,
    tenancy: &Tenancy,
    visibility: &Visibility,
    history_actor: &HistoryActor,
) -> FuncResult<()> {
    let existing_func =
        Func::find_by_attr(txn, tenancy, visibility, "name", &"si:unset".to_string()).await?;
    if existing_func.is_empty() {
        Func::new(
            txn,
            nats,
            tenancy,
            visibility,
            history_actor,
            "si:unset",
            FuncBackendKind::Unset,
            FuncBackendResponseType::Unset,
        )
        .await
        .expect("cannot create func");
    }
    Ok(())
}