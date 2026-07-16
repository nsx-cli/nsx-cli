import { describe, expect, it, vi } from 'vitest';
import { ExecutionPlan } from './execution-plan';
import { ExecutionStepType } from './execution-step-type';
import { CrudExecutor } from './crud-executor';

describe('CrudExecutor', () => {
  it('executa os steps na ordem do plano', async () => {
    const calls: string[] = [];

    const executors = [
      {
        supports: (step: { type: ExecutionStepType }) =>
          step.type === ExecutionStepType.CREATE_MODULE,
        execute: vi.fn(
          async (step: { type: ExecutionStepType; target: string }) => {
            calls.push(`${step.type}:${step.target}`);
          },
        ),
      },
      {
        supports: (step: { type: ExecutionStepType }) =>
          step.type === ExecutionStepType.ADD_PROVIDER,
        execute: vi.fn(
          async (step: { type: ExecutionStepType; target: string }) => {
            calls.push(`${step.type}:${step.target}`);
          },
        ),
      },
    ];

    const plan = new ExecutionPlan([
      { type: ExecutionStepType.CREATE_MODULE, target: 'user' },
      { type: ExecutionStepType.ADD_PROVIDER, target: 'user' },
    ]);

    const executor = new CrudExecutor(executors);
    const report = await executor.execute(plan, 'User');

    expect(calls).toEqual(['CREATE_MODULE:user', 'ADD_PROVIDER:user']);
    expect(report.modelName).toBe('User');
    expect(report.totalSteps).toBe(2);
  });

  it('lanca erro quando nenhum executor suporta o step', async () => {
    const executor = new CrudExecutor([]);
    const plan = new ExecutionPlan([
      { type: ExecutionStepType.CREATE_MODULE, target: 'user' },
    ]);

    await expect(executor.execute(plan)).rejects.toThrow(
      'No executor found for step: CREATE_MODULE',
    );
  });
});
