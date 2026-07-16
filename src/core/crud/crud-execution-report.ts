import { ExecutionStep } from "./execution-step";

export interface ExecutedStepReport {
  step: ExecutionStep;
  executorName: string;
}

export class CrudExecutionReport {
  constructor(
    public readonly modelName: string,
    public readonly startedAt: Date,
    public readonly finishedAt: Date,
    public readonly executedSteps: readonly ExecutedStepReport[]
  ) {}

  public get totalSteps(): number {
    return this.executedSteps.length;
  }

  public get durationMs(): number {
    return this.finishedAt.getTime() - this.startedAt.getTime();
  }
}