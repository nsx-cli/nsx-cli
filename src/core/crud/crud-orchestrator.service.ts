import { CrudOrchestrator } from "./crud-generator";
import { CrudExecutionReport } from "./crud-execution-report";
import { CrudExecutor } from "./crud-executor";
import { CrudPlanner } from "./crud-planner";
import { PrismaModel } from "../prisma/prisma-model";

export class CrudOrchestratorService implements CrudOrchestrator {
  constructor(
    private readonly planner: CrudPlanner,
    private readonly executor: CrudExecutor
  ) {}

  public async execute(model: PrismaModel): Promise<CrudExecutionReport> {
    const plan = this.planner.plan(model);
    return this.executor.execute(plan, model.name);
  }
}
