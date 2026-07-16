import path from "path";
import { DoctorIssue, DoctorReport, DoctorSectionReport } from "./doctor.types";

export class DoctorReportFormatter {
  public format(report: DoctorReport, outputPath: string): string {
    const lines: string[] = [];

    lines.push("# NSX Doctor Report");
    lines.push("");
    lines.push(`Generated at: ${report.generatedAt}`);
    lines.push(`Root: ${path.resolve(report.project.rootDir)}`);
    lines.push(`Report: ${outputPath}`);
    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push(`- Source files: ${report.statistics.sourceFiles}`);
    lines.push(`- Modules: ${report.statistics.modules}`);
    lines.push(`- Controllers: ${report.statistics.controllers}`);
    lines.push(`- Services: ${report.statistics.services}`);
    lines.push(`- Duplicate providers: ${report.statistics.duplicateProviders}`);
    lines.push(`- Unused imports: ${report.statistics.unusedImports}`);
    lines.push(`- Circular dependencies: ${report.statistics.circularDependencies}`);
    lines.push(`- TypeScript diagnostics: ${report.statistics.tsDiagnostics}`);
    lines.push("");

    for (const section of report.sections) {
      lines.push(this.formatSection(section));
    }

    return lines.join("\n");
  }

  public formatConsoleSummary(report: DoctorReport): string {
    const status = this.resolveOverallStatus(report);
    const lines: string[] = [];

    lines.push(`NSX Doctor ${status.toUpperCase()}`);
    lines.push(`Modules: ${report.statistics.modules} | Controllers: ${report.statistics.controllers} | Services: ${report.statistics.services}`);
    lines.push(`Duplicated providers: ${report.statistics.duplicateProviders} | Unused imports: ${report.statistics.unusedImports} | Cycles: ${report.statistics.circularDependencies}`);

    return lines.join("\n");
  }

  private formatSection(section: DoctorSectionReport): string {
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

  private formatIssue(issue: DoctorIssue): string {
    const location = this.formatLocation(issue.filePath, issue.line);
    const details = issue.details && issue.details.length > 0 ? ` | ${issue.details.join(" -> ")}` : "";

    return `- [${issue.severity.toUpperCase()}] ${issue.message}${location}${details}`;
  }

  private formatLocation(filePath?: string, line?: number): string {
    if (!filePath) {
      return "";
    }

    const normalizedPath = filePath.replace(/\\/g, "/");
    return line ? ` (${normalizedPath}:${line})` : ` (${normalizedPath})`;
  }

  private resolveOverallStatus(report: DoctorReport): string {
    if (report.sections.some((section) => section.status === "error")) {
      return "error";
    }

    if (report.sections.some((section) => section.status === "warning")) {
      return "warning";
    }

    return "ok";
  }
}