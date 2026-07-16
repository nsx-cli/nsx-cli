import { ExecutionStep } from "../execution-step";
import { ExecutionStepType } from "../execution-step-type";
import { ExecutionStepExecutor } from "../execution-step-executor";
import { IGenerator } from "../../../core/generator/igenerator";

export class CreateModuleExecutor implements ExecutionStepExecutor {
  constructor(private readonly generator: IGenerator) {}

  supports(step: ExecutionStep): boolean {
    return step.type === ExecutionStepType.CREATE_MODULE;
  }

  async execute(step: ExecutionStep): Promise<void> {
    await this.generator.generate(step.target);
  }
}
