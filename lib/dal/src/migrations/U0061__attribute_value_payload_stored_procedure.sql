CREATE OR REPLACE FUNCTION attribute_value_list_payload_for_read_context_v1(this_tenancy jsonb,
                                                                            this_visibility jsonb,
                                                                            this_context jsonb,
                                                                            this_prop_id bigint)
RETURNS TABLE(
    parent_attribute_value_id bigint,
    attribute_value_object json,
    prop_object json,
    func_binding_return_value_object json
)
AS
$$
DECLARE
    parent_attribute_value_id bigint;
BEGIN
    -- Grab the initial AttributeValueId based on the PropId we were given.
    EXECUTE
        'SELECT DISTINCT ON (' ||E'\n'||
        '    attribute_values.attribute_context_prop_id,' ||E'\n'||
        '    COALESCE(avbtav.belongs_to_id, -1),' ||E'\n'||
        '    COALESCE(attribute_values.key, '''')' ||E'\n'||
        ')' ||E'\n'||
        '    attribute_values.id AS attribute_value_id' ||E'\n'||
        'FROM' ||E'\n'||
        '    attribute_values' ||E'\n'||
        '    LEFT JOIN attribute_value_belongs_to_attribute_value AS avbtav ON' ||E'\n'||
        '        attribute_values.id = avbtav.object_id' ||E'\n'||
        '        AND in_tenancy_v1($1, avbtav.tenancy_universal,' ||E'\n'||
        '                              avbtav.tenancy_billing_account_ids,' ||E'\n'||
        '                              avbtav.tenancy_organization_ids,' ||E'\n'||
        '                              avbtav.tenancy_workspace_ids)' ||E'\n'||
        '        AND is_visible_v1($2, avbtav.visibility_change_set_pk,' ||E'\n'||
        '                              avbtav.visibility_edit_session_pk,' ||E'\n'||
        '                              avbtav.visibility_deleted_at)' ||E'\n'||
        '    INNER JOIN prop_many_to_many_schema_variants AS pmtmsv ON' ||E'\n'||
        '        attribute_values.attribute_context_prop_id = pmtmsv.left_object_id' ||E'\n'||
        '        AND in_tenancy_v1($1, pmtmsv.tenancy_universal,' ||E'\n'||
        '                              pmtmsv.tenancy_billing_account_ids,' ||E'\n'||
        '                              pmtmsv.tenancy_organization_ids,' ||E'\n'||
        '                              pmtmsv.tenancy_workspace_ids)' ||E'\n'||
        '        AND is_visible_v1($2, pmtmsv.visibility_change_set_pk,' ||E'\n'||
        '                              pmtmsv.visibility_edit_session_pk,' ||E'\n'||
        '                              pmtmsv.visibility_deleted_at)' ||E'\n'||
        'WHERE' ||E'\n'||
        '    in_tenancy_v1($1, attribute_values.tenancy_universal,' ||E'\n'||
        '                      attribute_values.tenancy_billing_account_ids,' ||E'\n'||
        '                      attribute_values.tenancy_organization_ids,' ||E'\n'||
        '                      attribute_values.tenancy_workspace_ids)' ||E'\n'||
        '    AND is_visible_v1($2, attribute_values.visibility_change_set_pk,' ||E'\n'||
        '                          attribute_values.visibility_edit_session_pk,' ||E'\n'||
        '                          attribute_values.visibility_deleted_at)' ||E'\n'||
        '    AND in_attribute_context_v1($3, attribute_values.attribute_context_prop_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_internal_provider_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_external_provider_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_schema_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_schema_variant_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_component_id,' ||E'\n'||
        '                                    attribute_values.attribute_context_system_id)' ||E'\n'||
        '    AND pmtmsv.right_object_id = $4' ||E'\n'||
        'ORDER BY' ||E'\n'||
        '    attribute_values.attribute_context_prop_id,' ||E'\n'||
        '    COALESCE(avbtav.belongs_to_id, -1),' ||E'\n'||
        '    COALESCE(attribute_values.key, ''''),' ||E'\n'||
        '    attribute_values.visibility_change_set_pk DESC,' ||E'\n'||
        '    attribute_values.visibility_edit_session_pk DESC,' ||E'\n'||
        '    attribute_values.visibility_deleted_at DESC NULLS FIRST,' ||E'\n'||
        '    attribute_values.attribute_context_internal_provider_id DESC,' ||E'\n'||
        '    attribute_values.attribute_context_external_provider_id DESC,' ||E'\n'||
        '    attribute_values.attribute_context_schema_id DESC,' ||E'\n'||
        '    attribute_values.attribute_context_schema_variant_id DESC,' ||E'\n'||
        '    attribute_values.attribute_context_component_id DESC,' ||E'\n'||
        '    attribute_values.attribute_context_system_id DESC' ||E'\n'
    INTO STRICT parent_attribute_value_id
    USING
        this_tenancy,
        this_visibility,
        this_context,
        this_prop_id;

    RETURN QUERY EXECUTE
        'SELECT * FROM attribute_value_list_payload_for_read_context_and_root_v1($1, $2, $3, $4)'
    USING
        this_tenancy,
        this_visibility,
        this_context,
        parent_attribute_value_id;
END;
$$ LANGUAGE PLPGSQL;