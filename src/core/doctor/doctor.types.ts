import type { Diagnostic } from 'ts-morph';
import type { ProjectScannerResult } from '../../services/project-scanner.service';

export type DoctorSeverity = 'info' | 'warning' | 'error';

export interface DoctorIssue {
  message: string;
  severity: DoctorSeverity;
  filePath?: string;
  line?: number;
  details?: string[];
}

export interface DoctorSectionReport {
  name: string;
  status: DoctorSeverity;
  summary: string;
  issues: DoctorIssue[];
}

export interface DoctorStatistics {
  sourceFiles: number;
  modules: number;
  controllers: number;
  services: number;
  duplicateProviders: number;
  unusedImports: number;
  circularDependencies: number;
  tsDiagnostics: number;
}

export interface DoctorReport {
  generatedAt: string;
  project: ProjectScannerResult;
  sections: DoctorSectionReport[];
  statistics: DoctorStatistics;
  tsDiagnostics: Diagnostic[];
}

export interface DoctorExecutionResult {
  report: DoctorReport;
  markdown: string;
  outputPath: string;
}
