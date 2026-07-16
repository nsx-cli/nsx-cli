import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { GraphCommand } from './graph.command';

describe('GraphCommand', () => {
  it('executa graph e imprime caminho do relatorio', async () => {
    const runMock = vi.fn().mockResolvedValue({
      outputPath: 'c:/workspace/.nsx/graph-report.md',
      report: {
        statistics: {
          totalNodes: 2,
          totalEdges: 1,
          cycles: 0,
        },
      },
    });

    const graphService = {
      run: runMock,
    };

    const command = new GraphCommand(graphService as never);
    const program = new Command();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    program.exitOverride();

    command.register(program);

    await program.parseAsync(['graph', '--output', 'c:/workspace/graph.md'], {
      from: 'user',
    });

    expect(runMock).toHaveBeenCalledWith({
      outputPath: 'c:/workspace/graph.md',
    });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Relatorio salvo em'),
    );

    logSpy.mockRestore();
  });
});
