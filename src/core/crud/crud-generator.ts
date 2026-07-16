import { PrismaEngine } from '../prisma/prisma-engine';
import { PrismaModel } from '../prisma/prisma-model';
import { CrudExecutionReport } from './crud-execution-report';
import { CrudModelNotFoundException } from './exceptions/crud-model-not-found.exception';

export interface CrudOrchestrator {
  execute(model: PrismaModel): Promise<CrudExecutionReport>;
}

export class CrudGenerator {
  constructor(
    private readonly prismaEngine: PrismaEngine,
    private readonly crudOrchestrator: CrudOrchestrator,
  ) {}

  public async generate(modelName: string): Promise<CrudExecutionReport> {
    await this.prismaEngine.load();
    const model = await this.getModel(modelName);
    return this.delegate(model);
  }

  protected async getModel(modelName: string): Promise<PrismaModel> {
    const model = this.prismaEngine.getModel(modelName);

    if (model === undefined) {
      throw new CrudModelNotFoundException(modelName);
    }

    return model;
  }

  protected async delegate(model: PrismaModel): Promise<CrudExecutionReport> {
    return this.crudOrchestrator.execute(model);
  }
}
