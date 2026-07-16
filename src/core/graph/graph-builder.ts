import path from "path";
import { Project, SourceFile } from "ts-morph";
import { GraphCycle, GraphEdge, GraphNode, GraphReport } from "./graph.types";
import type { ProjectScannerResult } from "../../services/project-scanner.service";

export class GraphBuilder {
  public build(project: Project, projectInfo: ProjectScannerResult): GraphReport {
    const sourceFiles = this.getWorkspaceSourceFiles(project, projectInfo.rootDir);
    const nodes = sourceFiles.map((sourceFile) => this.toNode(sourceFile));
    const idSet = new Set(nodes.map((node) => node.id));
    const edges = this.buildEdges(sourceFiles, idSet);
    const cycles = this.detectCycles(nodes, edges);

    return {
      generatedAt: new Date().toISOString(),
      project: projectInfo,
      nodes,
      edges,
      cycles,
      statistics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        cycles: cycles.length,
      },
    };
  }

  private getWorkspaceSourceFiles(project: Project, rootDir: string): SourceFile[] {
    const normalizedRoot = this.normalizePath(rootDir);

    return project
      .getSourceFiles()
      .filter((sourceFile) => {
        const filePath = this.normalizePath(sourceFile.getFilePath());

        return (
          filePath.startsWith(normalizedRoot) &&
          filePath.includes("/src/") &&
          !filePath.includes("/node_modules/") &&
          !sourceFile.isDeclarationFile()
        );
      })
      .sort((first, second) => first.getFilePath().localeCompare(second.getFilePath()));
  }

  private toNode(sourceFile: SourceFile): GraphNode {
    const id = this.normalizePath(sourceFile.getFilePath());

    return {
      id,
      label: sourceFile.getBaseNameWithoutExtension(),
      filePath: sourceFile.getFilePath(),
    };
  }

  private buildEdges(sourceFiles: SourceFile[], idSet: Set<string>): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const dedup = new Set<string>();

    for (const sourceFile of sourceFiles) {
      const from = this.normalizePath(sourceFile.getFilePath());

      for (const importDeclaration of sourceFile.getImportDeclarations()) {
        const importedFile = importDeclaration.getModuleSpecifierSourceFile();

        if (importedFile === undefined) {
          continue;
        }

        const to = this.normalizePath(importedFile.getFilePath());

        if (!idSet.has(to)) {
          continue;
        }

        const signature = `${from}->${to}`;

        if (dedup.has(signature)) {
          continue;
        }

        dedup.add(signature);
        edges.push({ from, to });
      }
    }

    return edges.sort((first, second) => `${first.from}:${first.to}`.localeCompare(`${second.from}:${second.to}`));
  }

  private detectCycles(nodes: GraphNode[], edges: GraphEdge[]): GraphCycle[] {
    const graph = new Map<string, string[]>();

    for (const node of nodes) {
      graph.set(node.id, []);
    }

    for (const edge of edges) {
      graph.get(edge.from)?.push(edge.to);
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const pathStack: string[] = [];
    const cycleSet = new Set<string>();
    const cycles: GraphCycle[] = [];

    const dfs = (node: string): void => {
      if (stack.has(node)) {
        const cycleStart = pathStack.indexOf(node);

        if (cycleStart >= 0) {
          const cyclePath = [...pathStack.slice(cycleStart), node];
          const key = cyclePath.join("->");

          if (!cycleSet.has(key)) {
            cycleSet.add(key);
            cycles.push({ path: cyclePath });
          }
        }

        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      stack.add(node);
      pathStack.push(node);

      for (const neighbor of graph.get(node) ?? []) {
        dfs(neighbor);
      }

      pathStack.pop();
      stack.delete(node);
    };

    for (const node of graph.keys()) {
      dfs(node);
    }

    return cycles;
  }

  private normalizePath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }
}
