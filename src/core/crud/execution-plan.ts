import { ExecutionStep } from './execution-step';

export class ExecutionPlan {
  private steps: ExecutionStep[];

  constructor(steps: readonly ExecutionStep[] = []) {
    this.steps = [...steps];
  }

  public addStep(step: ExecutionStep): void {
    this.steps = [...this.steps, step];
  }

  public removeStep(step: ExecutionStep): void {
    this.steps = this.steps.filter(
      (currentStep) => !this.sameStep(currentStep, step),
    );
  }

  public hasStep(step: ExecutionStep): boolean {
    return this.steps.some((currentStep) => this.sameStep(currentStep, step));
  }

  public getSteps(): readonly ExecutionStep[] {
    return [...this.steps];
  }

  public clear(): void {
    this.steps = [];
  }

  private sameStep(
    firstStep: ExecutionStep,
    secondStep: ExecutionStep,
  ): boolean {
    return (
      firstStep.type === secondStep.type &&
      firstStep.target === secondStep.target
    );
  }
}
