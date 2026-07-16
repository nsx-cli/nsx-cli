import { ExecutionStepType } from './execution-step-type';

export interface ExecutionStep {
  type: ExecutionStepType;
  target: string;
}
