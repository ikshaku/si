"use strict";

var _registry = require("../../registry");

_registry.registry.system({
  typeName: "billingAccount",
  displayTypeName: "System Initiative Billing Account",
  siPathName: "si-account",
  serviceName: "account",
  options: function options(c) {
    c.associations.hasMany({
      fieldName: "users",
      typeName: "user"
    });
    c.associations.hasMany({
      fieldName: "organizations",
      typeName: "organization"
    });
    c.associations.hasMany({
      fieldName: "workspaces",
      typeName: "workspace"
    });
    c.associations.hasMany({
      fieldName: "integrationInstances",
      typeName: "integrationInstance"
    });
    c.addListMethod();
    c.addGetMethod();
    c.methods.addMethod({
      name: "signup",
      label: "Create a Billing Account and Administrative User",
      options: function options(p) {
        p.mutation = true;
        p.skipAuth = true;
        p.request.properties.addObject({
          name: "billingAccount",
          label: "Billing Account Information",
          options: function options(p) {
            p.required = true;
            p.properties.addText({
              name: "name",
              label: "Billing Account Name",
              options: function options(p) {
                p.required = true;
              }
            });
            p.properties.addText({
              name: "displayName",
              label: "Billing Account Display Name",
              options: function options(p) {
                p.required = true;
              }
            });
          }
        });
        p.request.properties.addObject({
          name: "user",
          label: "User Information",
          options: function options(p) {
            p.required = true;
            p.properties.addText({
              name: "name",
              label: "User Name",
              options: function options(p) {
                p.required = true;
              }
            });
            p.properties.addText({
              name: "displayName",
              label: "User Display Name",
              options: function options(p) {
                p.required = true;
              }
            });
            p.properties.addText({
              name: "email",
              label: "A valid email address",
              options: function options(p) {
                p.universal = true;
                p.required = true;
              }
            });
            p.properties.addPassword({
              name: "password",
              label: "The users password hash",
              options: function options(p) {
                p.universal = true;
                p.required = true;
                p.hidden = true;
              }
            });
          }
        });
        p.reply.properties.addLink({
          name: "billingAccount",
          label: "Billing Account Object",
          options: function options(p) {
            p.lookup = {
              typeName: "billingAccount"
            };
          }
        });
        p.reply.properties.addLink({
          name: "user",
          label: "User Object",
          options: function options(p) {
            p.lookup = {
              typeName: "user"
            };
          }
        });
      }
    });
    c.methods.addMethod({
      name: "create",
      label: "Create a Billing Account",
      options: function options(p) {
        p.mutation = true;
        p.isPrivate = true;
        p.request.properties.addText({
          name: "name",
          label: "Billing Account Name",
          options: function options(p) {
            p.required = true;
          }
        });
        p.request.properties.addText({
          name: "displayName",
          label: "Billing Account Display Name",
          options: function options(p) {
            p.required = true;
          }
        });
        p.reply.properties.addLink({
          name: "item",
          label: "Billing Account Item",
          options: function options(p) {
            p.lookup = {
              typeName: "billingAccount"
            };
          }
        });
      }
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpLWFjY291bnQvYmlsbGluZ0FjY291bnQudHMiXSwibmFtZXMiOlsicmVnaXN0cnkiLCJzeXN0ZW0iLCJ0eXBlTmFtZSIsImRpc3BsYXlUeXBlTmFtZSIsInNpUGF0aE5hbWUiLCJzZXJ2aWNlTmFtZSIsIm9wdGlvbnMiLCJjIiwiYXNzb2NpYXRpb25zIiwiaGFzTWFueSIsImZpZWxkTmFtZSIsImFkZExpc3RNZXRob2QiLCJhZGRHZXRNZXRob2QiLCJtZXRob2RzIiwiYWRkTWV0aG9kIiwibmFtZSIsImxhYmVsIiwicCIsIm11dGF0aW9uIiwic2tpcEF1dGgiLCJyZXF1ZXN0IiwicHJvcGVydGllcyIsImFkZE9iamVjdCIsInJlcXVpcmVkIiwiYWRkVGV4dCIsInVuaXZlcnNhbCIsImFkZFBhc3N3b3JkIiwiaGlkZGVuIiwicmVwbHkiLCJhZGRMaW5rIiwibG9va3VwIiwiaXNQcml2YXRlIl0sIm1hcHBpbmdzIjoiOztBQUNBOztBQUdBQSxtQkFBU0MsTUFBVCxDQUFnQjtBQUNkQyxFQUFBQSxRQUFRLEVBQUUsZ0JBREk7QUFFZEMsRUFBQUEsZUFBZSxFQUFFLG1DQUZIO0FBR2RDLEVBQUFBLFVBQVUsRUFBRSxZQUhFO0FBSWRDLEVBQUFBLFdBQVcsRUFBRSxTQUpDO0FBS2RDLEVBQUFBLE9BTGMsbUJBS05DLENBTE0sRUFLVztBQUN2QkEsSUFBQUEsQ0FBQyxDQUFDQyxZQUFGLENBQWVDLE9BQWYsQ0FBdUI7QUFDckJDLE1BQUFBLFNBQVMsRUFBRSxPQURVO0FBRXJCUixNQUFBQSxRQUFRLEVBQUU7QUFGVyxLQUF2QjtBQUlBSyxJQUFBQSxDQUFDLENBQUNDLFlBQUYsQ0FBZUMsT0FBZixDQUF1QjtBQUNyQkMsTUFBQUEsU0FBUyxFQUFFLGVBRFU7QUFFckJSLE1BQUFBLFFBQVEsRUFBRTtBQUZXLEtBQXZCO0FBSUFLLElBQUFBLENBQUMsQ0FBQ0MsWUFBRixDQUFlQyxPQUFmLENBQXVCO0FBQ3JCQyxNQUFB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bSBcIi4uLy4uL2NvbXBvbmVudHMvcHJlbHVkZVwiO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tIFwiLi4vLi4vcmVnaXN0cnlcIjtcbmltcG9ydCB7IFN5c3RlbU9iamVjdCB9IGZyb20gXCIuLi8uLi9zeXN0ZW1Db21wb25lbnRcIjtcblxucmVnaXN0cnkuc3lzdGVtKHtcbiAgdHlwZU5hbWU6IFwiYmlsbGluZ0FjY291bnRcIixcbiAgZGlzcGxheVR5cGVOYW1lOiBcIlN5c3RlbSBJbml0aWF0aXZlIEJpbGxpbmcgQWNjb3VudFwiLFxuICBzaVBhdGhOYW1lOiBcInNpLWFjY291bnRcIixcbiAgc2VydmljZU5hbWU6IFwiYWNjb3VudFwiLFxuICBvcHRpb25zKGM6IFN5c3RlbU9iamVjdCkge1xuICAgIGMuYXNzb2NpYXRpb25zLmhhc01hbnkoe1xuICAgICAgZmllbGROYW1lOiBcInVzZXJzXCIsXG4gICAgICB0eXBlTmFtZTogXCJ1c2VyXCIsXG4gICAgfSk7XG4gICAgYy5hc3NvY2lhdGlvbnMuaGFzTWFueSh7XG4gICAgICBmaWVsZE5hbWU6IFwib3JnYW5pemF0aW9uc1wiLFxuICAgICAgdHlwZU5hbWU6IFwib3JnYW5pemF0aW9uXCIsXG4gICAgfSk7XG4gICAgYy5hc3NvY2lhdGlvbnMuaGFzTWFueSh7XG4gICAgICBmaWVsZE5hbWU6IFwid29ya3NwYWNlc1wiLFxuICAgICAgdHlwZU5hbWU6IFwid29ya3NwYWNlXCIsXG4gICAgfSk7XG4gICAgYy5hc3NvY2lhdGlvbnMuaGFzTWFueSh7XG4gICAgICBmaWVsZE5hbWU6IFwiaW50ZWdyYXRpb25JbnN0YW5jZXNcIixcbiAgICAgIHR5cGVOYW1lOiBcImludGVncmF0aW9uSW5zdGFuY2VcIixcbiAgICB9KTtcblxuICAgIGMuYWRkTGlzdE1ldGhvZCgpO1xuICAgIGMuYWRkR2V0TWV0aG9kKCk7XG5cbiAgICBjLm1ldGhvZHMuYWRkTWV0aG9kKHtcbiAgICAgIG5hbWU6IFwic2lnbnVwXCIsXG4gICAgICBsYWJlbDogXCJDcmVhdGUgYSBCaWxsaW5nIEFjY291bnQgYW5kIEFkbWluaXN0cmF0aXZlIFVzZXJcIixcbiAgICAgIG9wdGlvbnMocDogUHJvcE1ldGhvZCkge1xuICAgICAgICBwLm11dGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgcC5za2lwQXV0aCA9IHRydWU7XG4gICAgICAgIHAucmVxdWVzdC5wcm9wZXJ0aWVzLmFkZE9iamVjdCh7XG4gICAgICAgICAgbmFtZTogXCJiaWxsaW5nQWNjb3VudFwiLFxuICAgICAgICAgIGxhYmVsOiBcIkJpbGxpbmcgQWNjb3VudCBJbmZvcm1hdGlvblwiLFxuICAgICAgICAgIG9wdGlvbnMocDogUHJvcE9iamVjdCkge1xuICAgICAgICAgICAgcC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICBwLnByb3BlcnRpZXMuYWRkVGV4dCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwibmFtZVwiLFxuICAgICAgICAgICAgICBsYWJlbDogXCJCaWxsaW5nIEFjY291bnQgTmFtZVwiLFxuICAgICAgICAgICAgICBvcHRpb25zKHApIHtcbiAgICAgICAgICAgICAgICBwLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcC5wcm9wZXJ0aWVzLmFkZFRleHQoe1xuICAgICAgICAgICAgICBuYW1lOiBcImRpc3BsYXlOYW1lXCIsXG4gICAgICAgICAgICAgIGxhYmVsOiBcIkJpbGxpbmcgQWNjb3VudCBEaXNwbGF5IE5hbWVcIixcbiAgICAgICAgICAgICAgb3B0aW9ucyhwKSB7XG4gICAgICAgICAgICAgICAgcC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgcC5yZXF1ZXN0LnByb3BlcnRpZXMuYWRkT2JqZWN0KHtcbiAgICAgICAgICBuYW1lOiBcInVzZXJcIixcbiAgICAgICAgICBsYWJlbDogXCJVc2VyIEluZm9ybWF0aW9uXCIsXG4gICAgICAgICAgb3B0aW9ucyhwOiBQcm9wT2JqZWN0KSB7XG4gICAgICAgICAgICBwLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHAucHJvcGVydGllcy5hZGRUZXh0KHtcbiAgICAgICAgICAgICAgbmFtZTogXCJuYW1lXCIsXG4gICAgICAgICAgICAgIGxhYmVsOiBcIlVzZXIgTmFtZVwiLFxuICAgICAgICAgICAgICBvcHRpb25zKHApIHtcbiAgICAgICAgICAgICAgICBwLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcC5wcm9wZXJ0aWVzLmFkZFRleHQoe1xuICAgICAgICAgICAgICBuYW1lOiBcImRpc3BsYXlOYW1lXCIsXG4gICAgICAgICAgICAgIGxhYmVsOiBcIlVzZXIgRGlzcGxheSBOYW1lXCIsXG4gICAgICAgICAgICAgIG9wdGlvbnMocCkge1xuICAgICAgICAgICAgICAgIHAucmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwLnByb3BlcnRpZXMuYWRkVGV4dCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgbGFiZWw6IFwiQSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIsXG4gICAgICAgICAgICAgIG9wdGlvbnMocCkge1xuICAgICAgICAgICAgICAgIHAudW5pdmVyc2FsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcC5wcm9wZXJ0aWVzLmFkZFBhc3N3b3JkKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJwYXNzd29yZFwiLFxuICAgICAgICAgICAgICBsYWJlbDogXCJUaGUgdXNlcnMgcGFzc3dvcmQgaGFzaFwiLFxuICAgICAgICAgICAgICBvcHRpb25zKHApIHtcbiAgICAgICAgICAgICAgICBwLnVuaXZlcnNhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHAucmVwbHkucHJvcGVydGllcy5hZGRMaW5rKHtcbiAgICAgICAgICBuYW1lOiBcImJpbGxpbmdBY2NvdW50XCIsXG4gICAgICAgICAgbGFiZWw6IGBCaWxsaW5nIEFjY291bnQgT2JqZWN0YCxcbiAgICAgICAgICBvcHRpb25zKHA6IFByb3BMaW5rKSB7XG4gICAgICAgICAgICBwLmxvb2t1cCA9IHtcbiAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiYmlsbGluZ0FjY291bnRcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHAucmVwbHkucHJvcGVydGllcy5hZGRMaW5rKHtcbiAgICAgICAgICBuYW1lOiBcInVzZXJcIixcbiAgICAgICAgICBsYWJlbDogYFVzZXIgT2JqZWN0YCxcbiAgICAgICAgICBvcHRpb25zKHA6IFByb3BMaW5rKSB7XG4gICAgICAgICAgICBwLmxvb2t1cCA9IHtcbiAgICAgICAgICAgICAgdHlwZU5hbWU6IFwidXNlclwiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjLm1ldGhvZHMuYWRkTWV0aG9kKHtcbiAgICAgIG5hbWU6IFwiY3JlYXRlXCIsXG4gICAgICBsYWJlbDogXCJDcmVhdGUgYSBCaWxsaW5nIEFjY291bnRcIixcbiAgICAgIG9wdGlvbnMocDogUHJvcE1ldGhvZCkge1xuICAgICAgICBwLm11dGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgcC5pc1ByaXZhdGUgPSB0cnVlO1xuICAgICAgICBwLnJlcXVlc3QucHJvcGVydGllcy5hZGRUZXh0KHtcbiAgICAgICAgICBuYW1lOiBcIm5hbWVcIixcbiAgICAgICAgICBsYWJlbDogXCJCaWxsaW5nIEFjY291bnQgTmFtZVwiLFxuICAgICAgICAgIG9wdGlvbnMocCkge1xuICAgICAgICAgICAgcC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHAucmVxdWVzdC5wcm9wZXJ0aWVzLmFkZFRleHQoe1xuICAgICAgICAgIG5hbWU6IFwiZGlzcGxheU5hbWVcIixcbiAgICAgICAgICBsYWJlbDogXCJCaWxsaW5nIEFjY291bnQgRGlzcGxheSBOYW1lXCIsXG4gICAgICAgICAgb3B0aW9ucyhwKSB7XG4gICAgICAgICAgICBwLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgcC5yZXBseS5wcm9wZXJ0aWVzLmFkZExpbmsoe1xuICAgICAgICAgIG5hbWU6IFwiaXRlbVwiLFxuICAgICAgICAgIGxhYmVsOiBgQmlsbGluZyBBY2NvdW50IEl0ZW1gLFxuICAgICAgICAgIG9wdGlvbnMocDogUHJvcExpbmspIHtcbiAgICAgICAgICAgIHAubG9va3VwID0ge1xuICAgICAgICAgICAgICB0eXBlTmFtZTogXCJiaWxsaW5nQWNjb3VudFwiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG59KTtcbiJdfQ==