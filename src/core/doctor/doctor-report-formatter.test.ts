import { describe, expect, it } from 'vitest';
import { DoctorReportFormatter } from './doctor-report-formatter';
import type { DoctorReport } from './doctor.types';

describe('DoctorReportFormatter', () => {
  it('formata o relatório em markdown e resumo de console', () => {
    const formatter = new DoctorReportFormatter();
    const report = {
      generatedAt: '2026-07-14T00:00:00.000Z',
      project: {
        rootDir: 'c:/workspace',
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
      sections: [
        {
          name: 'Nest',
          status: 'info',
          summary: 'ok',
          issues: [{ severity: 'info', message: 'Nest detected' }],
        },
      ],
      statistics: {
        sourceFiles: 1,
        modules: 1,
        controllers: 1,
        services: 1,
        duplicateProviders: 0,
        unusedImports: 0,
        circularDependencies: 0,
        tsDiagnostics: 0,
      },
      tsDiagnostics: [],
    } satisfies DoctorReport;

    const markdown = formatter.format(
      report,
      'c:/workspace/.nsx/doctor-report.md',
    );
    const consoleSummary = formatter.formatConsoleSummary(report);

    expect(markdown).toContain('# NSX Doctor Report');
    expect(markdown).toContain('## Nest');
    expect(consoleSummary).toContain('NSX Doctor OK');
  });
});
