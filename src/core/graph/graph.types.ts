import type { ProjectScannerResult } from '../../services/project-scanner.service';

export interface GraphNode {
  id: string;
  label: string;
  filePath: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphCycle {
  path: string[];
}

export interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  cycles: number;
}

export interface GraphReport {
  generatedAt: string;
  project: ProjectScannerResult;
  nodes: GraphNode[];
  edges: GraphEdge[];
  cycles: GraphCycle[];
  statistics: GraphStatistics;
}

export interface GraphExecutionResult {
  report: GraphReport;
  markdown: string;
  outputPath: string;
}

export interface GraphRunOptions {
  outputPath?: string;
}
