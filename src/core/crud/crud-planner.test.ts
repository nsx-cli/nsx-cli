import { describe, expect, it } from 'vitest';
import { PrismaModel } from '../prisma/prisma-model';
import { CrudPlanner } from './crud-planner';
import { ExecutionStepType } from './execution-step-type';

describe('CrudPlanner', () => {
  it('monta o plano padrao para um PrismaModel', () => {
    const model = new PrismaModel({
      name: 'Usuario',
      fields: [],
      relations: [],
    });

    const planner = new CrudPlanner();
    const plan = planner.plan(model);

    expect(plan.getSteps()).toEqual([
      { type: ExecutionStepType.CREATE_MODULE, target: 'usuario' },
      { type: ExecutionStepType.CREATE_ENTITY, target: 'usuario' },
      { type: ExecutionStepType.CREATE_REPOSITORY, target: 'usuario' },
      { type: ExecutionStepType.CREATE_SERVICE, target: 'usuario' },
      { type: ExecutionStepType.CREATE_CONTROLLER, target: 'usuario' },
      { type: ExecutionStepType.CREATE_CREATE_DTO, target: 'usuario' },
      { type: ExecutionStepType.CREATE_UPDATE_DTO, target: 'usuario' },
      { type: ExecutionStepType.ADD_PROVIDER, target: 'usuario' },
      { type: ExecutionStepType.ADD_CONTROLLER, target: 'usuario' },
      { type: ExecutionStepType.ORGANIZE_IMPORTS, target: 'usuario' },
    ]);
  });
});
