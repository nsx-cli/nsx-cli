import { ExecutionPlan } from './execution-plan';
import {
  CrudExecutionReport,
  ExecutedStepReport,
} from './crud-execution-report';
import { ExecutionStepExecutor } from './execution-step-executor';
import { ExecutionStepExecutorRegistry } from './execution-step-executor-registry';

export class CrudExecutor {
  private readonly registry: ExecutionStepExecutorRegistry;

  constructor(executors: readonly ExecutionStepExecutor[] = []) {
    this.registry = new ExecutionStepExecutorRegistry(executors);
  }

  public async execute(
    plan: ExecutionPlan,
    modelName = 'unknown',
  ): Promise<CrudExecutionReport> {
    const startedAt = new Date();
    const executedSteps: ExecutedStepReport[] = [];

    for (const step of plan.getSteps()) {
      const executor = this.registry.resolve(step);

      if (executor === undefined) {
        throw new Error(`No executor found for step: ${step.type}`);
      }

      await executor.execute(step);
      executedSteps.push({ step, executorName: executor.constructor.name });
    }

    return new CrudExecutionReport(
      modelName,
      startedAt,
      new Date(),
      executedSteps,
    );
  }
}
