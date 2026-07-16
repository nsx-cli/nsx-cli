import { ExecutionStep } from './execution-step';

export interface ExecutionStepExecutor {
  supports(step: ExecutionStep): boolean;

  execute(step: ExecutionStep): Promise<void>;
}
