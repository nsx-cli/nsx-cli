import { PrismaModel } from '../prisma/prisma-model';
import { ExecutionPlan } from './execution-plan';
import { ExecutionStepType } from './execution-step-type';

const CRUD_STEP_TYPES = [
  ExecutionStepType.CREATE_MODULE,
  ExecutionStepType.CREATE_ENTITY,
  ExecutionStepType.CREATE_REPOSITORY,
  ExecutionStepType.CREATE_SERVICE,
  ExecutionStepType.CREATE_CONTROLLER,
  ExecutionStepType.CREATE_CREATE_DTO,
  ExecutionStepType.CREATE_UPDATE_DTO,
  ExecutionStepType.ADD_PROVIDER,
  ExecutionStepType.ADD_CONTROLLER,
  ExecutionStepType.ORGANIZE_IMPORTS,
] as const;

export class CrudPlanner {
  public plan(model: PrismaModel): ExecutionPlan {
    const plan = new ExecutionPlan();
    const target = this.resolveTarget(model);

    for (const stepType of CRUD_STEP_TYPES) {
      plan.addStep({ type: stepType, target });
    }

    return plan;
  }

  private resolveTarget(model: PrismaModel): string {
    return model.name.trim().toLowerCase();
  }
}
