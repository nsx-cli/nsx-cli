import type { ProjectScannerResult } from "../../services/project-scanner.service";

export type AnalyzeSeverity = "info" | "warning" | "error";

export interface AnalyzeIssue {
  message: string;
  severity: AnalyzeSeverity;
  filePath?: string;
}

export interface AnalyzeSection {
  name: string;
  status: AnalyzeSeverity;
  summary: string;
  issues: AnalyzeIssue[];
}

export interface AnalyzeStatistics {
  sourceFiles: number;
  averageComplexity: number;
  averageCoupling: number;
  averageCohesion: number;
  highComplexityFiles: number;
}

export interface AnalyzeReport {
  generatedAt: string;
  project: ProjectScannerResult;
  sections: AnalyzeSection[];
  statistics: AnalyzeStatistics;
}

export interface AnalyzeExecutionResult {
  report: AnalyzeReport;
  markdown: string;
  outputPath: string;
}