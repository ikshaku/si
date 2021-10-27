import { OpSource, SiEntity } from "si-entity/dist/siEntity";
import Debug from "debug";
const debug = Debug("veritech:controllers:intel:k8sService");
import {
  baseCheckQualifications,
  baseRunCommands,
  baseSyncResource,
  forEachCluster,
} from "./k8sShared";
import {
  InferPropertiesReply,
  InferPropertiesRequest,
} from "../controllers/inferProperties";
import {
  SetArrayEntriesFromAllEntities,
  setArrayEntriesFromAllEntites,
  setProperty,
  setPropertyFromEntity,
} from "./inferShared";
import { SiCtx } from "../siCtx";
import {
  CommandProtocolFinish,
  SyncResourceRequest,
} from "../controllers/syncResource";
import WebSocket from "ws";
import { ResourceInternalHealth } from "si-entity";

export function inferProperties(
  request: InferPropertiesRequest,
): InferPropertiesReply {
  const context = request.context;
  const entity = request.entity;

  setProperty({
    entity,
    toPath: ["metadata", "name"],
    value: entity.name,
  });

  // Do you have a k8s namespace? If so, set the namespace.
  setPropertyFromEntity({
    context,
    entityType: "k8sNamespace",
    fromPath: ["metadata", "name"],
    toEntity: entity,
    toPath: ["metadata", "namespace"],
  });

  setArrayEntriesFromAllEntites({
    entity,
    context,
    entityType: "k8sDeployment",
    toPath: ["spec", "ports"],
    valuesCallback(
      fromEntry,
    ): ReturnType<SetArrayEntriesFromAllEntities["valuesCallback"]> {
      const toSet = [];
      const containersBySystem: Record<
        string,
        Record<string, any>[]
      > = fromEntry.entity.getPropertyForAllSystems({
        path: ["spec", "template", "spec", "containers"],
      });
      for (const system in containersBySystem) {
        const containers = containersBySystem[system];
        for (const container of containers) {
          if (container["ports"]) {
            for (const portDef of container["ports"]) {
              const entry = [];
              if (portDef["name"]) {
                entry.push({
                  path: ["name"],
                  value: portDef["name"],
                  system,
                });
              }
              if (portDef["containerPort"]) {
                entry.push({
                  path: ["port"],
                  value: portDef["containerPort"],
                  system,
                });
              }
              if (portDef["protocol"]) {
                entry.push({
                  path: ["protocol"],
                  value: portDef["protocol"],
                  system,
                });
              }
              if (entry.length > 0) {
                toSet.push(entry);
              }
            }
          }
        }
      }
      debug("ready toSet", { toSet: JSON.stringify(toSet) });
      return toSet;
    },
  });

  setPropertyFromEntity({
    context,
    entityType: "k8sDeployment",
    fromPath: ["metadata", "labels", "app"],
    toEntity: entity,
    toPath: ["spec", "selector", "app"],
  });

  return { entity };
}

export async function syncResource(
  ctx: typeof SiCtx,
  req: SyncResourceRequest,
  ws: WebSocket,
): Promise<CommandProtocolFinish["finish"]> {
  const response = await baseSyncResource(ctx, req, ws);
  const system = req.system.id;

  const serviceType = req.entity.getProperty({
    system,
    path: ["spec", "type"],
  });
  const ports = req.entity.getProperty({ system, path: ["spec", "ports"] });
  if (serviceType == "LoadBalancer") {
    if (ports) {
      await forEachCluster(
        ctx,
        req,
        ws,
        async (_kubeYaml, _kubeConfigDir, kubeCluster) => {
          if (
            response.data[kubeCluster.id] &&
            // @ts-ignore
            response.data[kubeCluster.id]["data"] &&
            // @ts-ignore
            response.data[kubeCluster.id]["data"]["status"] &&
            // @ts-ignore
            response.data[kubeCluster.id]["data"]["status"]["loadBalancer"] &&
            // @ts-ignore
            response.data[kubeCluster.id]["data"]["status"]["loadBalancer"][
              "ingress"
            ]
          ) {
            // @ts-ignore
            for (const ingress of response.data[kubeCluster.id]["data"][
              "status"
            ]["loadBalancer"]["ingress"]) {
              // @ts-ignore
              if (ingress["hostname"]) {
                // @ts-ignore
                for (const port of ports) {
                  const result = await ctx.exec(
                    "nc",
                    ["-z", "-v", "-w5", ingress["hostname"], port["port"]],
                    { reject: false },
                  );
                  if (result.exitCode != 0) {
                    response.health = "error";
                    response.state = "error";
                    response.internalHealth = ResourceInternalHealth.Error;
                    response.error = result.all;
                    if (response.subResources[kubeCluster.id]) {
                      response.subResources[kubeCluster.id].health = "error";
                      response.subResources[kubeCluster.id].state = "error";
                      response.subResources[kubeCluster.id].internalHealth =
                        ResourceInternalHealth.Error;
                      response.subResources[kubeCluster.id].error = result.all;
                    }
                  }
                }
              }
            }
          }
        },
      );
      response.data = response.subResources;
    } else {
      response.state = "invalid";
      response.health = "unknown";
      response.internalHealth = ResourceInternalHealth.Unknown;
      response.error = "no port entries in spec; service cannot function";
    }
  }
  return response;
}

export default {
  inferProperties,
  checkQualifications: baseCheckQualifications,
  runCommands: baseRunCommands,
  syncResource,
};