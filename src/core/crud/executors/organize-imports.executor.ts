import { ExecutionStep } from "../execution-step";
import { ExecutionStepType } from "../execution-step-type";
import { ExecutionStepExecutor } from "../execution-step-executor";
import { OrganizeImportsOperation } from "../../ast/operations/organize-imports.operation";
import { ModuleCrudSupport } from "../module-crud-support";

export class OrganizeImportsExecutor implements ExecutionStepExecutor {
  constructor(
    private readonly moduleCrudSupport: ModuleCrudSupport,
    private readonly operation: OrganizeImportsOperation
  ) {}

  supports(step: ExecutionStep): boolean {
    return step.type === ExecutionStepType.ORGANIZE_IMPORTS;
  }

  async execute(step: ExecutionStep): Promise<void> {
    const sourceFile = this.moduleCrudSupport.loadModuleSourceFile(step.target);

    this.operation.execute({ sourceFile });

    await this.moduleCrudSupport.saveModuleSourceFile(sourceFile);
  }
}
