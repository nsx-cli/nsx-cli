import path from 'path';
import { GraphReport } from './graph.types';

export class GraphFormatter {
  public format(report: GraphReport, outputPath: string): string {
    const lines: string[] = [];

    lines.push('# NSX Graph Report');
    lines.push('');
    lines.push(`Generated at: ${report.generatedAt}`);
    lines.push(`Root: ${path.resolve(report.project.rootDir)}`);
    lines.push(`Report: ${outputPath}`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Nodes: ${report.statistics.totalNodes}`);
    lines.push(`- Edges: ${report.statistics.totalEdges}`);
    lines.push(`- Cycles: ${report.statistics.cycles}`);
    lines.push('');
    lines.push('## Graph');
    lines.push('');
    lines.push('```mermaid');
    lines.push('graph TD');

    for (const edge of report.edges) {
      const from = this.toMermaidNode(edge.from);
      const to = this.toMermaidNode(edge.to);
      lines.push(
        `  ${from.id}[\"${from.label}\"] --> ${to.id}[\"${to.label}\"]`,
      );
    }

    if (report.edges.length === 0) {
      lines.push('  empty["No edges"]');
    }

    lines.push('```');
    lines.push('');
    lines.push('## Cycles');
    lines.push('');

    if (report.cycles.length === 0) {
      lines.push('- No dependency cycles found.');
    } else {
      for (const cycle of report.cycles) {
        const normalized = cycle.path.map((entry) => this.toRelative(entry));
        lines.push(`- ${normalized.join(' -> ')}`);
      }
    }

    return lines.join('\n');
  }

  public formatConsoleSummary(report: GraphReport): string {
    const status = report.statistics.cycles > 0 ? 'warning' : 'ok';

    return [
      `NSX Graph ${status.toUpperCase()}`,
      `Nodes: ${report.statistics.totalNodes}`,
      `Edges: ${report.statistics.totalEdges}`,
      `Cycles: ${report.statistics.cycles}`,
    ].join(' | ');
  }

  private toMermaidNode(filePath: string): { id: string; label: string } {
    const normalized = filePath.replace(/[^a-zA-Z0-9_]/g, '_');
    const label = this.toRelative(filePath);

    return {
      id: normalized,
      label,
    };
  }

  private toRelative(filePath: string): string {
    return (
      path.relative(process.cwd(), filePath).replace(/\\/g, '/') || filePath
    );
  }
}
