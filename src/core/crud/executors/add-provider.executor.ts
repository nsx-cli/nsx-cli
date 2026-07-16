import { ExecutionStep } from '../execution-step';
import { ExecutionStepType } from '../execution-step-type';
import { ExecutionStepExecutor } from '../execution-step-executor';
import { AddProviderOperation } from '../../ast/operations/add-provider.operation';
import { ModuleCrudSupport } from '../module-crud-support';

export class AddProviderExecutor implements ExecutionStepExecutor {
  constructor(
    private readonly moduleCrudSupport: ModuleCrudSupport,
    private readonly operation: AddProviderOperation,
  ) {}

  supports(step: ExecutionStep): boolean {
    return step.type === ExecutionStepType.ADD_PROVIDER;
  }

  async execute(step: ExecutionStep): Promise<void> {
    const sourceFile = this.moduleCrudSupport.loadModuleSourceFile(step.target);

    this.operation.execute({
      sourceFile,
      providerName: `${this.moduleCrudSupport.resolvePascalCase(step.target)}Service`,
      importPath: `./${step.target}.service`,
    });

    await this.moduleCrudSupport.saveModuleSourceFile(sourceFile);
  }
}
