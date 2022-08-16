import Debug from "debug";
import { base64Decode } from "./base64";
import { NodeVM } from "vm2";
import {
  failureExecution,
  FunctionKind,
  Request,
  ResultFailure,
  ResultSuccess,
} from "./function";
import { createSandbox } from "./sandbox";
import { createNodeVm } from "./vm";

const debug = Debug("langJs:workflowResolve");

export interface WorkflowResolveRequest extends Request {
  handler: string;
  codeBase64: string;
}

export type WorkflowResolveResult =
  | WorkflowResolveResultSuccess
  | WorkflowResolveResultFailure;

export interface WorkflowResolveResultSuccess extends ResultSuccess {
  name: string;
  kind: string;
  steps: unknown;
  args: unknown;
}

export type WorkflowResolveResultFailure = ResultFailure;

export async function executeWorkflowResolve(
  request: WorkflowResolveRequest
): Promise<void> {
  let code = base64Decode(request.codeBase64);
  debug({ code });

  code = wrapCode(code, request.handler);
  debug({ code });

  const sandbox = createSandbox(
    FunctionKind.WorkflowResolve,
    request.executionId
  );
  const vm = createNodeVm(sandbox);

  const result = await execute(vm, code, request.executionId);
  debug({ result });

  console.log(JSON.stringify(result));
}

async function execute(
  vm: NodeVM,
  code: string,
  executionId: string
): Promise<WorkflowResolveResult> {
  let workflowResolveResult: Record<string, unknown>;
  try {
    const workflowResolveRunner = vm.run(code);
    // Node(paulo): NodeVM doesn't support async rejection, we need a better way of handling it
    workflowResolveResult = await new Promise((resolve) => {
      workflowResolveRunner((resolution: Record<string, unknown>) =>
        resolve(resolution)
      );
    });

    const result: WorkflowResolveResultSuccess = {
      protocol: "result",
      status: "success",
      executionId,
      name: workflowResolveResult.name as string,
      kind: workflowResolveResult.kind as string,
      steps: workflowResolveResult.steps,
      args: workflowResolveResult.args,
    };
    return result;
  } catch (err) {
    return failureExecution(err, executionId);
  }
}

function wrapCode(code: string, handle: string): string {
  const wrapped = `module.exports = function(callback) {
    ${code}
    const returnValue = ${handle}(callback);
    if (returnValue instanceof Promise) {
      returnValue.then((data) => callback(data))
        .catch((err) => {
          const message = "Uncaught throw in a promise, in function ${handle}: " + err.message;
          callback({
            message,
          })
        });
    } else {
      callback(returnValue);
    }
  };`;
  return wrapped;
}