import type { AnalyzeReport } from '../analyze/analyze.types';
import type { ProjectScannerResult } from '../../services/project-scanner.service';

export type FixOperationType =
  | 'RemoveUnusedImportsOperation'
  | 'OrganizeImportsOperation'
  | 'RegisterMissingProviderOperation'
  | 'RegisterMissingControllerOperation'
  | 'FixModuleExportsOperation'
  | 'FixBarrelExportsOperation';

export interface FixOperationStep {
  type: FixOperationType;
  filePath: string;
  description: string;
  data?: Record<string, string | string[] | boolean | number | undefined>;
}

export class ExecutionPlan {
  private steps: FixOperationStep[];

  constructor(steps: readonly FixOperationStep[] = []) {
    this.steps = [...steps];
  }

  public addStep(step: FixOperationStep): void {
    if (this.hasStep(step)) {
      return;
    }

    this.steps = [...this.steps, step];
  }

  public hasStep(step: FixOperationStep): boolean {
    return this.steps.some((current) => this.sameStep(current, step));
  }

  public getSteps(): readonly FixOperationStep[] {
    return [...this.steps];
  }

  public clear(): void {
    this.steps = [];
  }

  private sameStep(first: FixOperationStep, second: FixOperationStep): boolean {
    return (
      first.type === second.type &&
      first.filePath === second.filePath &&
      JSON.stringify(first.data ?? {}) === JSON.stringify(second.data ?? {})
    );
  }
}

export interface FixExecutionEntry {
  step: FixOperationStep;
  status: 'executed' | 'failed';
  error?: string;
}

export interface FixExecutionSummary {
  executedSteps: FixExecutionEntry[];
  successCount: number;
  failureCount: number;
}

export interface FixSummary {
  totalPlannedOperations: number;
  executedOperations: number;
  failedOperations: number;
  dryRun: boolean;
}

export interface FixReport {
  generatedAt: string;
  project: ProjectScannerResult;
  analyzeReport: AnalyzeReport;
  summary: FixSummary;
  executionPlan: readonly FixOperationStep[];
  execution: readonly FixExecutionEntry[];
}

export interface FixRunOptions {
  dryRun?: boolean;
  outputPath?: string;
}

export interface FixRunResult {
  report: FixReport;
  markdown: string;
  outputPath: string;
  preview: string;
}
