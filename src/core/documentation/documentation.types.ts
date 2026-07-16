import type { ProjectScannerResult } from "../../services/project-scanner.service";

export interface DocumentationRoute {
  controller: string;
  filePath: string;
  basePath: string;
}

export interface DocumentationPrismaSummary {
  enabled: boolean;
  schemaPath?: string;
  models: string[];
  enums: string[];
  errors: string[];
}

export interface DocumentationStructureSummary {
  sourceFiles: number;
  modules: number;
  controllers: number;
  services: number;
  repositories: number;
  entities: number;
  dtos: number;
}

export interface DocumentationSnapshot {
  generatedAt: string;
  project: ProjectScannerResult;
  structure: DocumentationStructureSummary;
  routes: DocumentationRoute[];
  prisma: DocumentationPrismaSummary;
}

export interface DocumentationExecutionResult {
  outputPath: string;
  markdown: string;
  snapshot: DocumentationSnapshot;
}