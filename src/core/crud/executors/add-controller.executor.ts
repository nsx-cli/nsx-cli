import { ExecutionStep } from '../execution-step';
import { ExecutionStepType } from '../execution-step-type';
import { ExecutionStepExecutor } from '../execution-step-executor';
import { AddControllerOperation } from '../../ast/operations/add-controller.operation';
import { ModuleCrudSupport } from '../module-crud-support';

export class AddControllerExecutor implements ExecutionStepExecutor {
  constructor(
    private readonly moduleCrudSupport: ModuleCrudSupport,
    private readonly operation: AddControllerOperation,
  ) {}

  supports(step: ExecutionStep): boolean {
    return step.type === ExecutionStepType.ADD_CONTROLLER;
  }

  async execute(step: ExecutionStep): Promise<void> {
    const sourceFile = this.moduleCrudSupport.loadModuleSourceFile(step.target);

    this.operation.execute({
      sourceFile,
      controllerName: `${this.moduleCrudSupport.resolvePascalCase(step.target)}Controller`,
      importPath: `./${step.target}.controller`,
    });

    await this.moduleCrudSupport.saveModuleSourceFile(sourceFile);
  }
}
