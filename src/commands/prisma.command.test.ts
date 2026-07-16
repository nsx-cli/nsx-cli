import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { PrismaCommand } from './prisma.command';

describe('PrismaCommand', () => {
  it('executa o CRUD quando o comando prisma crud e acionado', async () => {
    const generateMock = vi.fn().mockResolvedValue({
      modelName: 'User',
      durationMs: 5,
      totalSteps: 2,
      executedSteps: [
        {
          step: { type: 'CREATE_MODULE', target: 'user' },
          executorName: 'CreateModuleExecutor',
        },
        {
          step: { type: 'CREATE_SERVICE', target: 'user' },
          executorName: 'CreateServiceExecutor',
        },
      ],
    });
    const crudGenerator = {
      generate: generateMock,
    };

    const command = new PrismaCommand(crudGenerator as never);
    const program = new Command();
    program.exitOverride();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    command.register(program);

    await program.parseAsync(['prisma', 'crud', 'User'], { from: 'user' });

    expect(generateMock).toHaveBeenCalledWith('User');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
