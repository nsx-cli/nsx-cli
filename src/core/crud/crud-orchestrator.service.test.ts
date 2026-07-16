import { describe, expect, it, vi } from 'vitest';
import { CrudOrchestratorService } from './crud-orchestrator.service';
import { CrudPlanner } from './crud-planner';
import { CrudExecutor } from './crud-executor';
import { PrismaModel } from '../prisma/prisma-model';
import { ExecutionPlan } from './execution-plan';
import { ExecutionStepType } from './execution-step-type';

describe('CrudOrchestratorService', () => {
  it('transforma o model em plano e delega para o executor', async () => {
    const model = new PrismaModel({ name: 'User', fields: [], relations: [] });
    const plan = new ExecutionPlan([
      { type: ExecutionStepType.CREATE_MODULE, target: 'user' },
    ]);
    const planMock = vi.fn().mockReturnValue(plan);
    const executeMock = vi
      .fn()
      .mockResolvedValue({ modelName: 'User', totalSteps: 1 });

    const planner = {
      plan: planMock,
    } as unknown as CrudPlanner;

    const executor = {
      execute: executeMock,
    } as unknown as CrudExecutor;

    const orchestrator = new CrudOrchestratorService(planner, executor);

    const report = await orchestrator.execute(model);

    expect(planMock).toHaveBeenCalledWith(model);
    expect(executeMock).toHaveBeenCalledWith(plan, 'User');
    expect(report).toEqual({ modelName: 'User', totalSteps: 1 });
  });
});
