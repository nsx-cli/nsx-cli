import path from "path";
import { Diagnostic, Node, Project } from "ts-morph";
import { PrismaLoader } from "../prisma/prisma-loader";
import type { ProjectScannerResult } from "../../services/project-scanner.service";
import { DoctorIssue, DoctorReport, DoctorSectionReport, DoctorSeverity } from "./doctor.types";

interface NamedItem {
  filePath: string;
  className: string;
}

interface ProviderDuplicateIssue {
  filePath: string;
  line: number;
  providerName: string;
}

export class DoctorAnalyzer {
  constructor(private readonly prismaLoader: PrismaLoader = new PrismaLoader()) {}

  public async analyze(project: Project, projectInfo: ProjectScannerResult): Promise<DoctorReport> {
    const sourceFiles = this.getWorkspaceSourceFiles(project, projectInfo.rootDir);
    const modules = this.collectClassesByDecorator(sourceFiles, "Module");
    const controllers = this.collectClassesByDecorator(sourceFiles, "Controller");
    const services = this.collectClassesBySuffix(sourceFiles, "Service");
    const duplicateProviders = this.findDuplicateProviders(sourceFiles);
    const tsDiagnostics = this.collectTypeScriptDiagnostics(project);
    const unusedImports = this.findUnusedImports(tsDiagnostics);
    const circularDependencies = this.findCircularDependencies(sourceFiles);

    const sections: DoctorSectionReport[] = [
      this.buildNestSection(projectInfo, modules, controllers, services),
      await this.buildPrismaSection(projectInfo),
      this.buildTypeScriptSection(projectInfo, tsDiagnostics),
      this.buildModulesSection(modules),
      this.buildControllersSection(controllers),
      this.buildServicesSection(services),
      this.buildDuplicateProvidersSection(duplicateProviders),
      this.buildUnusedImportsSection(unusedImports),
      this.buildCircularDependenciesSection(circularDependencies),
    ];

    return {
      generatedAt: new Date().toISOString(),
      project: projectInfo,
      sections,
      statistics: {
        sourceFiles: sourceFiles.length,
        modules: modules.length,
        controllers: controllers.length,
        services: services.length,
        duplicateProviders: duplicateProviders.length,
        unusedImports: unusedImports.length,
        circularDependencies: circularDependencies.length,
        tsDiagnostics: tsDiagnostics.length,
      },
      tsDiagnostics,
    };
  }

  private getWorkspaceSourceFiles(project: Project, rootDir: string) {
    const normalizedRoot = this.normalizePath(rootDir);

    return project
      .getSourceFiles()
      .filter((sourceFile) => {
        const filePath = this.normalizePath(sourceFile.getFilePath());

        return filePath.startsWith(normalizedRoot) && !filePath.includes("/node_modules/") && !sourceFile.isDeclarationFile();
      })
      .sort((first, second) => first.getFilePath().localeCompare(second.getFilePath()));
  }

  private collectClassesByDecorator(sourceFiles: ReturnType<DoctorAnalyzer["getWorkspaceSourceFiles"]>, decoratorName: string): NamedItem[] {
    return sourceFiles.flatMap((sourceFile) =>
      sourceFile
        .getClasses()
        .filter((classDeclaration) => classDeclaration.getDecorator(decoratorName) !== undefined)
        .map((classDeclaration) => ({
          filePath: sourceFile.getFilePath(),
          className: classDeclaration.getName() ?? path.basename(sourceFile.getFilePath(), path.extname(sourceFile.getFilePath())),
        }))
    );
  }

  private collectClassesBySuffix(sourceFiles: ReturnType<DoctorAnalyzer["getWorkspaceSourceFiles"]>, suffix: string): NamedItem[] {
    return sourceFiles.flatMap((sourceFile) =>
      sourceFile
        .getClasses()
        .filter((classDeclaration) => (classDeclaration.getName() ?? "").endsWith(suffix))
        .map((classDeclaration) => ({
          filePath: sourceFile.getFilePath(),
          className: classDeclaration.getName() ?? path.basename(sourceFile.getFilePath(), path.extname(sourceFile.getFilePath())),
        }))
    );
  }

  private findDuplicateProviders(sourceFiles: ReturnType<DoctorAnalyzer["getWorkspaceSourceFiles"]>): ProviderDuplicateIssue[] {
    const issues: ProviderDuplicateIssue[] = [];

    for (const sourceFile of sourceFiles) {
      const moduleClass = sourceFile.getClasses().find((classDeclaration) => classDeclaration.getDecorator("Module") !== undefined);
      const moduleDecorator = moduleClass?.getDecorator("Module");
      const metadata = moduleDecorator?.getCallExpression()?.getArguments()[0];

      if (metadata === undefined || !Node.isObjectLiteralExpression(metadata)) {
        continue;
      }

      const providersProperty = metadata.getProperty("providers");

      if (providersProperty === undefined || !Node.isPropertyAssignment(providersProperty)) {
        continue;
      }

      const initializer = providersProperty.getInitializer();

      if (initializer === undefined || !Node.isArrayLiteralExpression(initializer)) {
        continue;
      }

      const seen = new Map<string, number>();

      for (const element of initializer.getElements()) {
        const providerName = element.getText().trim();
        seen.set(providerName, (seen.get(providerName) ?? 0) + 1);
      }

      for (const [providerName, count] of seen.entries()) {
        if (count > 1) {
          issues.push({
            filePath: sourceFile.getFilePath(),
            line: providersProperty.getStartLineNumber(),
            providerName,
          });
        }
      }
    }

    return issues;
  }

  private findUnusedImports(diagnostics: Diagnostic[]): DoctorIssue[] {
    return diagnostics
      .filter((diagnostic) => diagnostic.getCode() === 6192)
      .map((diagnostic) => ({
        severity: "warning" as DoctorSeverity,
        message: diagnostic.getMessageText().toString(),
        filePath: diagnostic.getSourceFile()?.getFilePath(),
        line: diagnostic.getLineNumber(),
      }));
  }

  private findCircularDependencies(sourceFiles: ReturnType<DoctorAnalyzer["getWorkspaceSourceFiles"]>): DoctorIssue[] {
    const fileMap = new Map<string, string>();
    const graph = new Map<string, string[]>();

    for (const sourceFile of sourceFiles) {
      const normalizedPath = this.normalizePath(sourceFile.getFilePath());
      fileMap.set(normalizedPath, sourceFile.getFilePath());
      graph.set(normalizedPath, []);
    }

    for (const sourceFile of sourceFiles) {
      const from = this.normalizePath(sourceFile.getFilePath());

      for (const importDeclaration of sourceFile.getImportDeclarations()) {
        const target = this.resolveImportTarget(sourceFile.getFilePath(), importDeclaration.getModuleSpecifierValue(), fileMap);

        if (target !== undefined) {
          graph.get(from)?.push(target);
        }
      }
    }

    const issues: DoctorIssue[] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    const currentPath: string[] = [];
    const seenCycles = new Set<string>();

    const visit = (node: string): void => {
      if (stack.has(node)) {
        const cycleStart = currentPath.indexOf(node);

        if (cycleStart >= 0) {
          const cycle = [...currentPath.slice(cycleStart), node];
          const signature = cycle.join(" -> ");

          if (!seenCycles.has(signature)) {
            seenCycles.add(signature);
            issues.push({
              severity: "error",
              message: `Dependência circular detectada: ${cycle.map((entry) => this.toRelative(entry)).join(" -> ")}`,
              details: cycle.map((entry) => this.toRelative(entry)),
            });
          }
        }

        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      stack.add(node);
      currentPath.push(node);

      for (const neighbor of graph.get(node) ?? []) {
        visit(neighbor);
      }

      currentPath.pop();
      stack.delete(node);
    };

    for (const node of graph.keys()) {
      visit(node);
    }

    return issues;
  }

  private collectTypeScriptDiagnostics(project: Project): Diagnostic[] {
    return project.getPreEmitDiagnostics();
  }

  private async buildPrismaSection(projectInfo: ProjectScannerResult): Promise<DoctorSectionReport> {
    if (!projectInfo.usesPrisma) {
      return {
        name: "Prisma",
        status: "warning",
        summary: "Prisma não foi detectado nas dependências do projeto.",
        issues: [
          {
            severity: "warning",
            message: "Dependências Prisma não encontradas no package.json.",
          },
        ],
      };
    }

    try {
      const schema = await this.prismaLoader.load();

      return {
        name: "Prisma",
        status: "info",
        summary: `Schema Prisma encontrado em ${this.toRelative(schema.path)}.`,
        issues: [
          {
            severity: "info",
            message: `Schema Prisma carregado com sucesso: ${this.toRelative(schema.path)}`,
          },
        ],
      };
    } catch (error) {
      return {
        name: "Prisma",
        status: "error",
        summary: "Falha ao localizar ou ler o schema Prisma.",
        issues: [
          {
            severity: "error",
            message: error instanceof Error ? error.message : "Erro desconhecido ao validar Prisma.",
          },
        ],
      };
    }
  }

  private buildNestSection(
    projectInfo: ProjectScannerResult,
    modules: NamedItem[],
    controllers: NamedItem[],
    services: NamedItem[]
  ): DoctorSectionReport {
    if (!projectInfo.isNestJs) {
      return {
        name: "Nest",
        status: "warning",
        summary: "O projeto não foi identificado como NestJS.",
        issues: [
          {
            severity: "warning",
            message: "Nenhuma dependência NestJS principal foi encontrada.",
          },
        ],
      };
    }

    return {
      name: "Nest",
      status: "info",
      summary: `${modules.length} módulos, ${controllers.length} controllers e ${services.length} services identificados.`,
      issues: [
        {
          severity: "info",
          message: "Projeto identificado como NestJS.",
        },
      ],
    };
  }

  private buildTypeScriptSection(projectInfo: ProjectScannerResult, diagnostics: Diagnostic[]): DoctorSectionReport {
    if (!projectInfo.tsconfigPath) {
      return {
        name: "TypeScript",
        status: "warning",
        summary: "tsconfig.json não encontrado.",
        issues: [
          {
            severity: "warning",
            message: "Não foi possível validar TypeScript sem tsconfig.json.",
          },
        ],
      };
    }

    const errors = diagnostics.filter((diagnostic) => diagnostic.getCategory() === 1);
    const issues = errors.slice(0, 20).map((diagnostic) => ({
      severity: "error" as DoctorSeverity,
      message: diagnostic.getMessageText().toString(),
      filePath: diagnostic.getSourceFile()?.getFilePath(),
      line: diagnostic.getLineNumber(),
    }));

    return {
      name: "TypeScript",
      status: errors.length > 0 ? "error" : "info",
      summary: errors.length > 0 ? `${errors.length} erro(s) de TypeScript encontrados.` : "Nenhum erro de TypeScript encontrado.",
      issues: issues.length > 0 ? issues : [{ severity: "info", message: "TypeScript validado sem erros." }],
    };
  }

  private buildModulesSection(modules: NamedItem[]): DoctorSectionReport {
    return {
      name: "Modules",
      status: modules.length > 0 ? "info" : "warning",
      summary: modules.length > 0 ? `${modules.length} módulos encontrados.` : "Nenhum módulo encontrado.",
      issues: modules.length > 0
        ? modules.slice(0, 20).map((module) => ({
            severity: "info" as DoctorSeverity,
            message: `Módulo encontrado: ${module.className}`,
            filePath: module.filePath,
          }))
        : [
            {
              severity: "warning",
              message: "Nenhum módulo Nest foi identificado no workspace.",
            },
          ],
    };
  }

  private buildControllersSection(controllers: NamedItem[]): DoctorSectionReport {
    return {
      name: "Controllers",
      status: controllers.length > 0 ? "info" : "warning",
      summary: controllers.length > 0 ? `${controllers.length} controllers encontrados.` : "Nenhum controller encontrado.",
      issues: controllers.length > 0
        ? controllers.slice(0, 20).map((controller) => ({
            severity: "info" as DoctorSeverity,
            message: `Controller encontrado: ${controller.className}`,
            filePath: controller.filePath,
          }))
        : [
            {
              severity: "warning",
              message: "Nenhum controller foi identificado no workspace.",
            },
          ],
    };
  }

  private buildServicesSection(services: NamedItem[]): DoctorSectionReport {
    return {
      name: "Services",
      status: services.length > 0 ? "info" : "warning",
      summary: services.length > 0 ? `${services.length} services encontrados.` : "Nenhum service encontrado.",
      issues: services.length > 0
        ? services.slice(0, 20).map((service) => ({
            severity: "info" as DoctorSeverity,
            message: `Service encontrado: ${service.className}`,
            filePath: service.filePath,
          }))
        : [
            {
              severity: "warning",
              message: "Nenhum service foi identificado no workspace.",
            },
          ],
    };
  }

  private buildDuplicateProvidersSection(issues: ProviderDuplicateIssue[]): DoctorSectionReport {
    return {
      name: "Providers duplicados",
      status: issues.length > 0 ? "error" : "info",
      summary: issues.length > 0 ? `${issues.length} provider(es) duplicado(s) encontrado(s).` : "Nenhum provider duplicado encontrado.",
      issues: issues.length > 0
        ? issues.map((issue) => ({
            severity: "error" as DoctorSeverity,
            message: `Provider duplicado: ${issue.providerName}`,
            filePath: issue.filePath,
            line: issue.line,
          }))
        : [
            {
              severity: "info",
              message: "Nenhum provider duplicado foi identificado.",
            },
          ],
    };
  }

  private buildUnusedImportsSection(issues: DoctorIssue[]): DoctorSectionReport {
    return {
      name: "Imports não utilizados",
      status: issues.length > 0 ? "warning" : "info",
      summary: issues.length > 0 ? `${issues.length} import(es) não utilizado(s) encontrado(s).` : "Nenhum import não utilizado encontrado.",
      issues: issues.length > 0
        ? issues
        : [
            {
              severity: "info",
              message: "Nenhum import não utilizado foi identificado.",
            },
          ],
    };
  }

  private buildCircularDependenciesSection(issues: DoctorIssue[]): DoctorSectionReport {
    return {
      name: "Dependências circulares",
      status: issues.length > 0 ? "error" : "info",
      summary: issues.length > 0 ? `${issues.length} ciclo(s) de dependência encontrados.` : "Nenhuma dependência circular encontrada.",
      issues: issues.length > 0
        ? issues
        : [
            {
              severity: "info",
              message: "Nenhuma dependência circular foi identificada.",
            },
          ],
    };
  }

  private resolveImportTarget(sourceFilePath: string, moduleSpecifier: string, fileMap: Map<string, string>): string | undefined {
    if (!moduleSpecifier.startsWith(".")) {
      return undefined;
    }

    const basePath = this.normalizePath(path.resolve(path.dirname(sourceFilePath), moduleSpecifier));
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.jsx`,
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.tsx"),
      path.join(basePath, "index.js"),
      path.join(basePath, "index.jsx"),
    ].map((candidate) => this.normalizePath(candidate));

    for (const candidate of candidates) {
      const resolved = fileMap.get(candidate);

      if (resolved !== undefined) {
        return candidate;
      }
    }

    return undefined;
  }

  private toRelative(filePath: string): string {
    return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  }

  private normalizePath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }
}