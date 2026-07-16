import path from "path";
import { Node, ObjectLiteralExpression, Project, SourceFile } from "ts-morph";
import type { AnalyzeReport } from "../analyze/analyze.types";
import { ExecutionPlan } from "./fix-result";

export class FixPlanner {
  public plan(project: Project, _analyzeReport: AnalyzeReport): ExecutionPlan {
    const plan = new ExecutionPlan();
    const moduleFiles = project
      .getSourceFiles()
      .filter((sourceFile) => sourceFile.getBaseName().endsWith(".module.ts") && this.isWorkspaceSourceFile(sourceFile.getFilePath()));

    for (const moduleFile of moduleFiles) {
      this.planForModule(project, moduleFile, plan);
    }

    return plan;
  }

  private planForModule(project: Project, moduleFile: SourceFile, plan: ExecutionPlan): void {
    const moduleMetadata = this.resolveModuleMetadata(moduleFile);

    if (moduleMetadata === undefined) {
      return;
    }

    const providerNames = this.readMetadataArray(moduleMetadata, "providers");
    const controllerNames = this.readMetadataArray(moduleMetadata, "controllers");
    const exportNames = this.readMetadataArray(moduleMetadata, "exports");

    const siblingFiles = this.getSiblingSourceFiles(project, moduleFile);
    const serviceFiles = siblingFiles.filter((sourceFile) => sourceFile.getBaseName().endsWith(".service.ts"));
    const controllerFiles = siblingFiles.filter((sourceFile) => sourceFile.getBaseName().endsWith(".controller.ts"));

    let plannedMutations = false;

    for (const serviceFile of serviceFiles) {
      const className = serviceFile.getClasses()[0]?.getName();

      if (className === undefined) {
        continue;
      }

      if (!providerNames.includes(className)) {
        plan.addStep({
          type: "RegisterMissingProviderOperation",
          filePath: moduleFile.getFilePath(),
          description: `Registrar provider ausente: ${className}`,
          data: {
            providerName: className,
            importPath: this.resolveRelativeImportPath(moduleFile.getFilePath(), serviceFile.getFilePath()),
          },
        });
        plannedMutations = true;
      }

      if (!exportNames.includes(className)) {
        plan.addStep({
          type: "FixModuleExportsOperation",
          filePath: moduleFile.getFilePath(),
          description: `Adicionar export ausente no módulo: ${className}`,
          data: {
            exportName: className,
            importPath: this.resolveRelativeImportPath(moduleFile.getFilePath(), serviceFile.getFilePath()),
          },
        });
        plannedMutations = true;
      }
    }

    for (const controllerFile of controllerFiles) {
      const className = controllerFile.getClasses()[0]?.getName();

      if (className === undefined) {
        continue;
      }

      if (!controllerNames.includes(className)) {
        plan.addStep({
          type: "RegisterMissingControllerOperation",
          filePath: moduleFile.getFilePath(),
          description: `Registrar controller ausente: ${className}`,
          data: {
            controllerName: className,
            importPath: this.resolveRelativeImportPath(moduleFile.getFilePath(), controllerFile.getFilePath()),
          },
        });
        plannedMutations = true;
      }
    }

    if (plannedMutations) {
      plan.addStep({
        type: "OrganizeImportsOperation",
        filePath: moduleFile.getFilePath(),
        description: "Organizar imports do módulo",
      });

      plan.addStep({
        type: "RemoveUnusedImportsOperation",
        filePath: moduleFile.getFilePath(),
        description: "Remover imports não utilizados do módulo",
      });
    }

    this.planBarrelExports(moduleFile, siblingFiles, plan);
  }

  private planBarrelExports(moduleFile: SourceFile, siblingFiles: SourceFile[], plan: ExecutionPlan): void {
    const directory = moduleFile.getDirectoryPath();
    const indexFilePath = path.join(directory, "index.ts");
    const indexFile = moduleFile.getProject().getSourceFile(indexFilePath);
    const exportTargets = siblingFiles
      .filter((sourceFile) => this.canBeBarrelExported(sourceFile, moduleFile))
      .map((sourceFile) => `./${sourceFile.getBaseNameWithoutExtension()}`)
      .sort((first, second) => first.localeCompare(second));

    if (exportTargets.length === 0) {
      return;
    }

    const existingExports = new Set((indexFile?.getExportDeclarations() ?? []).map((entry) => entry.getModuleSpecifierValue()));
    const missingExports = exportTargets.filter((target) => !existingExports.has(target));

    if (missingExports.length === 0) {
      return;
    }

    plan.addStep({
      type: "FixBarrelExportsOperation",
      filePath: indexFilePath,
      description: `Adicionar ${missingExports.length} export(s) ausente(s) no barrel do módulo`,
      data: {
        exportTargets: missingExports,
      },
    });
  }

  private resolveModuleMetadata(sourceFile: SourceFile): ObjectLiteralExpression | undefined {
    const moduleClass = sourceFile.getClasses().find((classDeclaration) => classDeclaration.getDecorator("Module") !== undefined);
    const moduleDecorator = moduleClass?.getDecorator("Module");
    const callExpression = moduleDecorator?.getCallExpression();
    const firstArgument = callExpression?.getArguments()[0];

    if (!firstArgument || !Node.isObjectLiteralExpression(firstArgument)) {
      return undefined;
    }

    return firstArgument;
  }

  private readMetadataArray(metadata: ObjectLiteralExpression, key: string): string[] {
    const property = metadata.getProperty(key);

    if (property === undefined || !Node.isPropertyAssignment(property)) {
      return [];
    }

    const initializer = property.getInitializer();

    if (!initializer || !Node.isArrayLiteralExpression(initializer)) {
      return [];
    }

    return initializer.getElements().map((element) => element.getText().trim());
  }

  private resolveRelativeImportPath(fromPath: string, toPath: string): string {
    const fromDirectory = path.dirname(fromPath);
    const rawPath = path.relative(fromDirectory, toPath).replace(/\\/g, "/");
    const withoutExtension = rawPath.replace(/\.ts$/, "");

    return withoutExtension.startsWith(".") ? withoutExtension : `./${withoutExtension}`;
  }

  private getSiblingSourceFiles(project: Project, moduleFile: SourceFile): SourceFile[] {
    const moduleDir = path.resolve(moduleFile.getDirectoryPath()).replace(/\\/g, "/");

    return project
      .getSourceFiles()
      .filter((sourceFile) => {
        const sourceDir = path.resolve(sourceFile.getDirectoryPath()).replace(/\\/g, "/");

        return sourceDir === moduleDir && this.isWorkspaceSourceFile(sourceFile.getFilePath());
      })
      .sort((first, second) => first.getBaseName().localeCompare(second.getBaseName()));
  }

  private canBeBarrelExported(sourceFile: SourceFile, moduleFile: SourceFile): boolean {
    if (sourceFile.getFilePath() === moduleFile.getFilePath()) {
      return true;
    }

    return sourceFile.getBaseName().endsWith(".service.ts") || sourceFile.getBaseName().endsWith(".controller.ts");
  }

  private isWorkspaceSourceFile(filePath: string): boolean {
    const normalized = path.resolve(filePath).replace(/\\/g, "/");
    return normalized.includes("/src/") && !normalized.includes("/node_modules/");
  }
}
