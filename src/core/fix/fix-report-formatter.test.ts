import { describe, expect, it } from 'vitest';
import { FixReportFormatter } from './fix-report';
import type { FixReport } from './fix-result';

function createReport(overrides: Partial<FixReport> = {}): FixReport {
  return {
    generatedAt: '2026-07-14T00:00:00.000Z',
    project: {
      rootDir: process.cwd(),
      packageJsonPath: null,
      tsconfigPath: null,
      nestCliPath: null,
      packageJson: null,
      tsconfig: null,
      nestCli: null,
      isNestJs: true,
      usesPrisma: false,
      usesTypeORM: false,
    },
    analyzeReport: {
      generatedAt: '2026-07-14T00:00:00.000Z',
      project: {
        rootDir: process.cwd(),
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      },
      sections: [],
      statistics: {
        sourceFiles: 10,
        averageComplexity: 2,
        averageCoupling: 1,
        averageCohesion: 70,
        highComplexityFiles: 0,
      },
    },
    summary: {
      totalPlannedOperations: 1,
      executedOperations: 1,
      failedOperations: 0,
      dryRun: true,
    },
    executionPlan: [
      {
        type: 'OrganizeImportsOperation',
        filePath: 'src/a.ts',
        description: 'organize',
      },
    ],
    execution: [
      {
        step: {
          type: 'OrganizeImportsOperation',
          filePath: 'src/a.ts',
          description: 'organize',
        },
        status: 'executed',
      },
    ],
    ...overrides,
  };
}

describe('FixReportFormatter', () => {
  it('formata preview, console e markdown com operações', () => {
    const formatter = new FixReportFormatter();
    const report = createReport();

    expect(formatter.formatPreview(report)).toContain(
      'Operações planejadas: 1',
    );
    expect(formatter.formatConsoleSummary(report)).toContain(
      'NSX Fix OK (DRY-RUN)',
    );

    const markdown = formatter.formatMarkdown(report, 'out.md');
    expect(markdown).toContain('# NSX Fix Report');
    expect(markdown).toContain('Planned operations: 1');
    expect(markdown).toContain('EXECUTED');
  });

  it('cobre branches sem operações e com falhas', () => {
    const formatter = new FixReportFormatter();
    const report = createReport({
      summary: {
        totalPlannedOperations: 0,
        executedOperations: 0,
        failedOperations: 1,
        dryRun: false,
      },
      executionPlan: [],
      execution: [
        {
          step: {
            type: 'FixModuleExportsOperation',
            filePath: 'src/b.ts',
            description: 'fix',
          },
          status: 'failed',
          error: 'boom',
        },
      ],
    });

    expect(formatter.formatPreview(report)).toContain(
      'Nenhuma alteração necessária',
    );
    expect(formatter.formatConsoleSummary(report)).toContain(
      'NSX Fix WARNING (APPLY)',
    );

    const markdown = formatter.formatMarkdown(report, 'out.md');
    expect(markdown).toContain('No operations planned');
    expect(markdown).toContain('FAILED');
    expect(markdown).toContain('boom');
  });
});
