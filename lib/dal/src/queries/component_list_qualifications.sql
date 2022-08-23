SELECT DISTINCT ON (qualification_resolvers.id) qualification_resolvers.id,
                                                qualification_prototypes.visibility_change_set_pk,

                                                qualification_resolvers.visibility_change_set_pk,

                                                row_to_json(qualification_prototypes)     AS prototype,
                                                row_to_json(func_binding_return_values.*) AS object,
                                                json_build_object('display_name', funcs.display_name, 'description',
                                                                  funcs.description,
                                                                  'link', funcs.link)     AS func_metadata_view
FROM qualification_resolvers
         INNER JOIN func_binding_return_value_belongs_to_func_binding ON
        func_binding_return_value_belongs_to_func_binding.belongs_to_id = qualification_resolvers.func_binding_id
         INNER JOIN func_binding_return_values ON
        func_binding_return_values.id = func_binding_return_value_belongs_to_func_binding.object_id
         INNER JOIN qualification_prototypes ON
        qualification_prototypes.id = qualification_resolvers.qualification_prototype_id
         INNER JOIN funcs ON
            funcs.id = qualification_prototypes.func_id
        AND in_tenancy_v1($1, qualification_prototypes.tenancy_universal,
                          qualification_prototypes.tenancy_billing_account_ids,
                          qualification_prototypes.tenancy_organization_ids,
                          qualification_prototypes.tenancy_workspace_ids)
        AND is_visible_v1($2, qualification_prototypes.visibility_change_set_pk,
                          qualification_prototypes.visibility_deleted_at)
WHERE in_tenancy_v1($1, qualification_resolvers.tenancy_universal, qualification_resolvers.tenancy_billing_account_ids,
                    qualification_resolvers.tenancy_organization_ids, qualification_resolvers.tenancy_workspace_ids)
  AND is_visible_v1($2, qualification_resolvers.visibility_change_set_pk, qualification_resolvers.visibility_deleted_at)
  AND is_visible_v1($2,
                    func_binding_return_value_belongs_to_func_binding.visibility_change_set_pk,
                    func_binding_return_value_belongs_to_func_binding.visibility_deleted_at)
  AND is_visible_v1($2,
                    func_binding_return_values.visibility_change_set_pk,
                    func_binding_return_values.visibility_deleted_at)
  AND is_visible_v1($2, funcs.visibility_change_set_pk, funcs.visibility_deleted_at)
  AND qualification_resolvers.component_id = $3
  AND (qualification_resolvers.system_id = $4 OR qualification_resolvers.system_id = -1)
ORDER BY qualification_resolvers.id,
         qualification_prototypes.visibility_change_set_pk DESC,
         qualification_resolvers.visibility_change_set_pk DESC;
