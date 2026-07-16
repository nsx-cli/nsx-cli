import path from "path";
import { Project, SourceFile, SyntaxKind } from "ts-morph";
import type { ProjectScannerResult } from "../../services/project-scanner.service";
import { AnalyzeIssue, AnalyzeReport, AnalyzeSection } from "./analyze.types";

interface FileMetrics {
  filePath: string;
  complexity: number;
  coupling: number;
  cohesion: number;
}

export class AnalyzeAnalyzer {
  public async analyze(project: Project, projectInfo: ProjectScannerResult): Promise<AnalyzeReport> {
    const sourceFiles = this.getWorkspaceSourceFiles(project, projectInfo.rootDir);
    const metrics = sourceFiles.map((sourceFile) => this.computeMetrics(sourceFile));

    const sections: AnalyzeSection[] = [
      this.buildComplexitySection(metrics),
      this.buildCouplingSection(metrics),
      this.buildCohesionSection(metrics),
      this.buildArchitectureSection(sourceFiles),
      this.buildSuggestionsSection(metrics),
    ];

    return {
      generatedAt: new Date().toISOString(),
      project: projectInfo,
      sections,
      statistics: {
        sourceFiles: sourceFiles.length,
        averageComplexity: this.average(metrics.map((item) => item.complexity)),
        averageCoupling: this.average(metrics.map((item) => item.coupling)),
        averageCohesion: this.average(metrics.map((item) => item.cohesion)),
        highComplexityFiles: metrics.filter((item) => item.complexity >= 10).length,
      },
    };
  }

  private getWorkspaceSourceFiles(project: Project, rootDir: string): SourceFile[] {
    const normalizedRoot = this.normalizePath(rootDir);

    return project
      .getSourceFiles()
      .filter((sourceFile) => {
        const filePath = this.normalizePath(sourceFile.getFilePath());

        return filePath.startsWith(normalizedRoot) && !filePath.includes("/node_modules/") && !sourceFile.isDeclarationFile();
      })
      .sort((first, second) => first.getFilePath().localeCompare(second.getFilePath()));
  }

  private computeMetrics(sourceFile: SourceFile): FileMetrics {
    const complexity = this.computeComplexity(sourceFile);
    const coupling = this.computeCoupling(sourceFile);
    const cohesion = this.computeCohesion(sourceFile);

    return {
      filePath: sourceFile.getFilePath(),
      complexity,
      coupling,
      cohesion,
    };
  }

  private computeComplexity(sourceFile: SourceFile): number {
    let complexity = 1;

    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.ForStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.ForInStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.ForOfStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.WhileStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.DoStatement).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.CaseClause).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause).length;
    complexity += sourceFile.getDescendantsOfKind(SyntaxKind.ConditionalExpression).length;

    return complexity;
  }

  private computeCoupling(sourceFile: SourceFile): number {
    return sourceFile.getImportDeclarations().filter((declaration) => declaration.getModuleSpecifierValue().startsWith(".")).length;
  }

  private computeCohesion(sourceFile: SourceFile): number {
    const classes = sourceFile.getClasses();

    if (classes.length === 0) {
      return 100;
    }

    const classScores = classes.map((classDeclaration) => {
      const methods = classDeclaration.getMethods().length;
      const properties = classDeclaration.getProperties().length;

      if (methods === 0 && properties === 0) {
        return 100;
      }

      const totalMembers = methods + properties;
      const ratio = methods / totalMembers;

      return Math.round(ratio * 100);
    });

    return this.average(classScores);
  }

  private buildComplexitySection(metrics: FileMetrics[]): AnalyzeSection {
    const issues = metrics
      .filter((item) => item.complexity >= 10)
      .map((item) => ({
        severity: "warning" as const,
        message: `Complexidade alta: ${item.complexity}`,
        filePath: item.filePath,
      }));

    return {
      name: "Complexidade",
      status: issues.length > 0 ? "warning" : "info",
      summary: issues.length > 0 ? `${issues.length} arquivo(s) com complexidade alta.` : "Complexidade dentro do esperado.",
      issues,
    };
  }

  private buildCouplingSection(metrics: FileMetrics[]): AnalyzeSection {
    const issues = metrics
      .filter((item) => item.coupling >= 8)
      .map((item) => ({
        severity: "warning" as const,
        message: `Acoplamento elevado: ${item.coupling} imports relativos`,
        filePath: item.filePath,
      }));

    return {
      name: "Acoplamento",
      status: issues.length > 0 ? "warning" : "info",
      summary: issues.length > 0 ? `${issues.length} arquivo(s) com acoplamento elevado.` : "Acoplamento dentro do esperado.",
      issues,
    };
  }

  private buildCohesionSection(metrics: FileMetrics[]): AnalyzeSection {
    const issues = metrics
      .filter((item) => item.cohesion < 40)
      .map((item) => ({
        severity: "warning" as const,
        message: `Coesão baixa: ${item.cohesion}%`,
        filePath: item.filePath,
      }));

    return {
      name: "Coesão",
      status: issues.length > 0 ? "warning" : "info",
      summary: issues.length > 0 ? `${issues.length} arquivo(s) com coesão baixa.` : "Coesão dentro do esperado.",
      issues,
    };
  }

  private buildArchitectureSection(sourceFiles: SourceFile[]): AnalyzeSection {
    const paths = sourceFiles.map((sourceFile) => this.normalizePath(sourceFile.getFilePath()));
    const requiredSegments = ["/src/core/", "/src/commands/", "/src/generators/", "/src/bootstrap/"];

    const issues: AnalyzeIssue[] = [];

    for (const segment of requiredSegments) {
      const exists = paths.some((filePath) => filePath.includes(segment));

      if (!exists) {
        issues.push({
          severity: "error",
          message: `Camada arquitetural ausente: ${segment.replace("/src/", "src/")}`,
        });
      }
    }

    return {
      name: "Arquitetura",
      status: issues.some((item) => item.severity === "error") ? "error" : "info",
      summary: issues.length > 0 ? "Inconsistências arquiteturais detectadas." : "Arquitetura base encontrada e consistente.",
      issues,
    };
  }

  private buildSuggestionsSection(metrics: FileMetrics[]): AnalyzeSection {
    const issues: AnalyzeIssue[] = [];
    const avgComplexity = this.average(metrics.map((item) => item.complexity));
    const avgCoupling = this.average(metrics.map((item) => item.coupling));
    const avgCohesion = this.average(metrics.map((item) => item.cohesion));

    if (avgComplexity >= 8) {
      issues.push({
        severity: "warning",
        message: "Reduzir complexidade média com extração de estratégias e orquestradores.",
      });
    }

    if (avgCoupling >= 6) {
      issues.push({
        severity: "warning",
        message: "Reduzir acoplamento com inversão de dependência e serviços de camada.",
      });
    }

    if (avgCohesion < 50) {
      issues.push({
        severity: "warning",
        message: "Aumentar coesão separando responsabilidades por classe/módulo.",
      });
    }

    if (issues.length === 0) {
      issues.push({
        severity: "info",
        message: "Nenhuma ação crítica recomendada no momento.",
      });
    }

    return {
      name: "Sugestões",
      status: issues.some((item) => item.severity === "warning") ? "warning" : "info",
      summary: "Sugestões técnicas para evolução da arquitetura e manutenção.",
      issues,
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((accumulator, value) => accumulator + value, 0);
    return Math.round((total / values.length) * 100) / 100;
  }

  private normalizePath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }
}