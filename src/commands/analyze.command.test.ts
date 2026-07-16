import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { AnalyzeCommand } from './analyze.command';

describe('AnalyzeCommand', () => {
  it('executa analyze e imprime resumo', async () => {
    const runMock = vi.fn().mockResolvedValue({
      report: {
        statistics: {
          sourceFiles: 1,
          averageComplexity: 1,
          averageCoupling: 1,
          averageCohesion: 100,
          highComplexityFiles: 0,
        },
        sections: [],
      },
      outputPath: 'c:/workspace/.nsx/analyze-report.md',
    });

    const analyzeService = {
      run: runMock,
    };

    const command = new AnalyzeCommand(analyzeService as never);
    const program = new Command();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    program.exitOverride();

    command.register(program);

    await program.parseAsync(
      ['analyze', '--output', 'c:/workspace/report.md'],
      { from: 'user' },
    );

    expect(runMock).toHaveBeenCalledWith({
      outputPath: 'c:/workspace/report.md',
    });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Relatório salvo em'),
    );

    logSpy.mockRestore();
  });
});
