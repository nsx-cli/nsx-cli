import path from 'path';
import { FixReport } from './fix-result';

export class FixReportFormatter {
  public formatPreview(report: FixReport): string {
    if (report.executionPlan.length === 0) {
      return 'NSX Fix Preview | Nenhuma alteração necessária.';
    }

    const previewItems = report.executionPlan.map(
      (step, index) => `${index + 1}. ${step.type} -> ${step.filePath}`,
    );

    return [
      `NSX Fix Preview | Operações planejadas: ${report.summary.totalPlannedOperations}`,
      ...previewItems,
    ].join('\n');
  }

  public formatConsoleSummary(report: FixReport): string {
    const mode = report.summary.dryRun ? 'DRY-RUN' : 'APPLY';
    const status = report.summary.failedOperations > 0 ? 'WARNING' : 'OK';

    return [
      `NSX Fix ${status} (${mode})`,
      `Planned: ${report.summary.totalPlannedOperations}`,
      `Executed: ${report.summary.executedOperations}`,
      `Failed: ${report.summary.failedOperations}`,
    ].join(' | ');
  }

  public formatMarkdown(report: FixReport, outputPath: string): string {
    const lines: string[] = [];

    lines.push('# NSX Fix Report');
    lines.push('');
    lines.push(`Generated at: ${report.generatedAt}`);
    lines.push(`Root: ${path.resolve(report.project.rootDir)}`);
    lines.push(`Report: ${outputPath}`);
    lines.push(`Dry-run: ${report.summary.dryRun}`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(
      `- Planned operations: ${report.summary.totalPlannedOperations}`,
    );
    lines.push(`- Executed operations: ${report.summary.executedOperations}`);
    lines.push(`- Failed operations: ${report.summary.failedOperations}`);
    lines.push('');
    lines.push('## Planned Operations');
    lines.push('');

    if (report.executionPlan.length === 0) {
      lines.push('- No operations planned.');
    } else {
      for (const step of report.executionPlan) {
        lines.push(
          `- ${step.type}: ${step.description} (${step.filePath.replace(/\\/g, '/')})`,
        );
      }
    }

    lines.push('');
    lines.push('## Execution');
    lines.push('');

    if (report.execution.length === 0) {
      lines.push('- No operations executed.');
    } else {
      for (const execution of report.execution) {
        const error = execution.error ? ` | ${execution.error}` : '';
        lines.push(
          `- ${execution.status.toUpperCase()}: ${execution.step.type} (${execution.step.filePath.replace(/\\/g, '/')})${error}`,
        );
      }
    }

    lines.push('');
    lines.push('## Analyze Snapshot');
    lines.push('');
    lines.push(
      `- Source files: ${report.analyzeReport.statistics.sourceFiles}`,
    );
    lines.push(
      `- Average complexity: ${report.analyzeReport.statistics.averageComplexity}`,
    );
    lines.push(
      `- Average coupling: ${report.analyzeReport.statistics.averageCoupling}`,
    );
    lines.push(
      `- Average cohesion: ${report.analyzeReport.statistics.averageCohesion}`,
    );

    return lines.join('\n');
  }
}
