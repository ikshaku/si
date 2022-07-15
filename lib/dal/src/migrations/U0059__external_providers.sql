CREATE TABLE external_providers
(
    pk                          bigserial PRIMARY KEY,
    id                          bigserial                NOT NULL,
    tenancy_universal           bool                     NOT NULL,
    tenancy_billing_account_ids bigint[],
    tenancy_organization_ids    bigint[],
    tenancy_workspace_ids       bigint[],
    visibility_change_set_pk    bigint,
    visibility_edit_session_pk  bigint,
    visibility_deleted_at       timestamp with time zone,
    created_at                  timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at                  timestamp with time zone NOT NULL DEFAULT NOW(),
    schema_id                   bigint                   NOT NULL,
    schema_variant_id           bigint                   NOT NULL,
    attribute_prototype_id      bigint,
    name                        text                     NOT NULL,
    type_definition             text
);

CREATE UNIQUE INDEX unique_external_providers
    ON external_providers (name,
                           schema_id,
                           schema_variant_id,
                           visibility_change_set_pk,
                           visibility_edit_session_pk,
                           (visibility_deleted_at IS NULL))
    WHERE visibility_deleted_at IS NULL;

SELECT standard_model_table_constraints_v1('external_providers');
SELECT belongs_to_table_create_v1('socket_belongs_to_external_provider', 'sockets', 'external_providers');

INSERT INTO standard_models (table_name, table_type, history_event_label_base, history_event_message_name)
VALUES ('external_providers', 'model', 'external_provider', 'Output Provider'),
       ('socket_belongs_to_external_provider', 'belongs_to', 'socket.external_provider', 'Socket <> External Provider');

CREATE OR REPLACE FUNCTION external_provider_create_v1(
    this_tenancy jsonb,
    this_visibility jsonb,
    this_schema_id bigint,
    this_schema_variant_id bigint,
    this_name text,
    this_type_definition text,
    OUT object json) AS
$$
DECLARE
    this_tenancy_record    tenancy_record_v1;
    this_visibility_record visibility_record_v1;
    this_new_row           external_providers%ROWTYPE;
BEGIN
    this_tenancy_record := tenancy_json_to_columns_v1(this_tenancy);
    this_visibility_record := visibility_json_to_columns_v1(this_visibility);

    INSERT INTO external_providers (tenancy_universal,
                                    tenancy_billing_account_ids,
                                    tenancy_organization_ids,
                                    tenancy_workspace_ids,
                                    visibility_change_set_pk,
                                    visibility_edit_session_pk,
                                    visibility_deleted_at,
                                    schema_id,
                                    schema_variant_id,
                                    name,
                                    type_definition)
    VALUES (this_tenancy_record.tenancy_universal,
            this_tenancy_record.tenancy_billing_account_ids,
            this_tenancy_record.tenancy_organization_ids,
            this_tenancy_record.tenancy_workspace_ids,
            this_visibility_record.visibility_change_set_pk,
            this_visibility_record.visibility_edit_session_pk,
            this_visibility_record.visibility_deleted_at,
            this_schema_id,
            this_schema_variant_id,
            this_name,
            this_type_definition)
    RETURNING * INTO this_new_row;

    object := row_to_json(this_new_row);
END;
$$ LANGUAGE PLPGSQL VOLATILE;