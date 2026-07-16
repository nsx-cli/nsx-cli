import { ExecutionStep } from "./execution-step";
import { ExecutionStepExecutor } from "./execution-step-executor";

export class ExecutionStepExecutorRegistry {
  private readonly executors: readonly ExecutionStepExecutor[];

  constructor(executors: readonly ExecutionStepExecutor[] = []) {
    this.executors = executors;
  }

  public resolve(step: ExecutionStep): ExecutionStepExecutor | undefined {
    return this.executors.find((executor) => executor.supports(step));
  }

  public list(): readonly ExecutionStepExecutor[] {
    return this.executors;
  }
}