import path from "path";
import { AnalyzeIssue, AnalyzeReport, AnalyzeSection } from "./analyze.types";

export class AnalyzeFormatter {
  public format(report: AnalyzeReport, outputPath: string): string {
    const lines: string[] = [];

    lines.push("# NSX Analyze Report");
    lines.push("");
    lines.push(`Generated at: ${report.generatedAt}`);
    lines.push(`Root: ${path.resolve(report.project.rootDir)}`);
    lines.push(`Report: ${outputPath}`);
    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push(`- Source files: ${report.statistics.sourceFiles}`);
    lines.push(`- Average complexity: ${report.statistics.averageComplexity}`);
    lines.push(`- Average coupling: ${report.statistics.averageCoupling}`);
    lines.push(`- Average cohesion: ${report.statistics.averageCohesion}`);
    lines.push(`- High complexity files: ${report.statistics.highComplexityFiles}`);
    lines.push("");

    for (const section of report.sections) {
      lines.push(this.formatSection(section));
    }

    return lines.join("\n");
  }

  public formatConsoleSummary(report: AnalyzeReport): string {
    const status = this.resolveOverallStatus(report);

    return [
      `NSX Analyze ${status.toUpperCase()}`,
      `Complexity(avg): ${report.statistics.averageComplexity}`,
      `Coupling(avg): ${report.statistics.averageCoupling}`,
      `Cohesion(avg): ${report.statistics.averageCohesion}`,
      `High complexity files: ${report.statistics.highComplexityFiles}`,
    ].join(" | ");
  }

  private formatSection(section: AnalyzeSection): string {
    const lines: string[] = [];

    lines.push(`## ${section.name}`);
    lines.push("");
    lines.push(`Status: ${section.status.toUpperCase()}`);
    lines.push(`Summary: ${section.summary}`);
    lines.push("");

    if (section.issues.length === 0) {
      lines.push("- No issues found.");
      lines.push("");
      return lines.join("\n");
    }

    for (const issue of section.issues) {
      lines.push(this.formatIssue(issue));
    }

    lines.push("");
    return lines.join("\n");
  }

  private formatIssue(issue: AnalyzeIssue): string {
    const location = issue.filePath ? ` (${issue.filePath.replace(/\\/g, "/")})` : "";
    return `- [${issue.severity.toUpperCase()}] ${issue.message}${location}`;
  }

  private resolveOverallStatus(report: AnalyzeReport): string {
    if (report.sections.some((section) => section.status === "error")) {
      return "error";
    }

    if (report.sections.some((section) => section.status === "warning")) {
      return "warning";
    }

    return "ok";
  }
}