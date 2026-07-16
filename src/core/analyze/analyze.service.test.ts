import { describe, expect, it } from 'vitest';
import { AnalyzeService } from './analyze.service';

describe('AnalyzeService', () => {
  it('gera relatório de análise', async () => {
    const scanner = {
      scan: async () => ({
        rootDir: 'c:/repo',
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: true,
        usesTypeORM: false,
      }),
    };

    const analyzer = {
      analyze: async () => ({
        generatedAt: '2026-07-14T00:00:00.000Z',
        project: {
          rootDir: 'c:/repo',
          packageJsonPath: null,
          tsconfigPath: null,
          nestCliPath: null,
          packageJson: null,
          tsconfig: null,
          nestCli: null,
          isNestJs: true,
          usesPrisma: true,
          usesTypeORM: false,
        },
        sections: [],
        statistics: {
          sourceFiles: 0,
          averageComplexity: 0,
          averageCoupling: 0,
          averageCohesion: 0,
          highComplexityFiles: 0,
        },
      }),
    };

    const formatter = {
      format: () => '# analyze',
    };

    const fileService = {
      find: async () => [],
      ensureDirectory: async () => undefined,
      writeFile: async () => undefined,
    };

    const service = new AnalyzeService(
      scanner as never,
      analyzer as never,
      formatter as never,
      fileService as never,
    );
    const result = await service.run({
      outputPath: 'c:/repo/.nsx/analyze-report.md',
    });

    expect(result.outputPath).toBe('c:/repo/.nsx/analyze-report.md');
    expect(result.markdown).toBe('# analyze');
  });
});
