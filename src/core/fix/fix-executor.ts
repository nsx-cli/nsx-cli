import { SourceFile } from "ts-morph";
import { AstProjectContext } from "../ast/ast-project-context";
import { AddControllerOperation } from "../ast/operations/add-controller.operation";
import { AddProviderOperation } from "../ast/operations/add-provider.operation";
import { ensureArrayProperty, ensureNamedImport, resolveModuleMetadataObject } from "../ast/operations/module-metadata.operation-utils";
import { OrganizeImportsOperation as AstOrganizeImportsOperation } from "../ast/operations/organize-imports.operation";
import { ExecutionPlan, FixExecutionEntry, FixExecutionSummary, FixOperationStep } from "./fix-result";

interface RegisterProviderInput {
  sourceFile: SourceFile;
  providerName: string;
  importPath: string;
}

interface RegisterControllerInput {
  sourceFile: SourceFile;
  controllerName: string;
  importPath: string;
}

interface FixModuleExportsInput {
  sourceFile: SourceFile;
  exportName: string;
  importPath: string;
}

interface FixBarrelExportsInput {
  sourceFile: SourceFile;
  exportTargets: string[];
}

export class RemoveUnusedImportsOperation {
  constructor(private readonly organizeImportsOperation: AstOrganizeImportsOperation = new AstOrganizeImportsOperation()) {}

  public execute(sourceFile: SourceFile): void {
    this.organizeImportsOperation.execute({ sourceFile });
  }
}

export class OrganizeImportsOperation {
  constructor(private readonly operation: AstOrganizeImportsOperation = new AstOrganizeImportsOperation()) {}

  public execute(sourceFile: SourceFile): void {
    this.operation.execute({ sourceFile });
  }
}

export class RegisterMissingProviderOperation {
  constructor(private readonly operation: AddProviderOperation = new AddProviderOperation()) {}

  public execute(input: RegisterProviderInput): void {
    this.operation.execute({
      sourceFile: input.sourceFile,
      providerName: input.providerName,
      importPath: input.importPath,
    });
  }
}

export class RegisterMissingControllerOperation {
  constructor(private readonly operation: AddControllerOperation = new AddControllerOperation()) {}

  public execute(input: RegisterControllerInput): void {
    this.operation.execute({
      sourceFile: input.sourceFile,
      controllerName: input.controllerName,
      importPath: input.importPath,
    });
  }
}

export class FixModuleExportsOperation {
  public execute(input: FixModuleExportsInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const exportsArray = ensureArrayProperty(metadataObject, "exports");
    const exists = exportsArray
      .getElements()
      .some((element) => element.getText().trim() === input.exportName);

    if (!exists) {
      exportsArray.addElement(input.exportName);
    }

    ensureNamedImport(input.sourceFile, input.exportName, input.importPath);
  }
}

export class FixBarrelExportsOperation {
  public execute(input: FixBarrelExportsInput): void {
    const existingExports = new Set(input.sourceFile.getExportDeclarations().map((entry) => entry.getModuleSpecifierValue()));

    for (const exportTarget of input.exportTargets) {
      if (existingExports.has(exportTarget)) {
        continue;
      }

      input.sourceFile.addExportDeclaration({
        moduleSpecifier: exportTarget,
      });
      existingExports.add(exportTarget);
    }
  }
}

export class FixExecutor {
  constructor(
    private readonly projectContext: AstProjectContext,
    private readonly removeUnusedImportsOperation: RemoveUnusedImportsOperation = new RemoveUnusedImportsOperation(),
    private readonly organizeImportsOperation: OrganizeImportsOperation = new OrganizeImportsOperation(),
    private readonly registerMissingProviderOperation: RegisterMissingProviderOperation = new RegisterMissingProviderOperation(),
    private readonly registerMissingControllerOperation: RegisterMissingControllerOperation = new RegisterMissingControllerOperation(),
    private readonly fixModuleExportsOperation: FixModuleExportsOperation = new FixModuleExportsOperation(),
    private readonly fixBarrelExportsOperation: FixBarrelExportsOperation = new FixBarrelExportsOperation()
  ) {}

  public execute(plan: ExecutionPlan): FixExecutionSummary {
    const executedSteps: FixExecutionEntry[] = [];

    for (const step of plan.getSteps()) {
      try {
        this.executeStep(step);
        executedSteps.push({ step, status: "executed" });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        executedSteps.push({ step, status: "failed", error: message });
      }
    }

    const successCount = executedSteps.filter((entry) => entry.status === "executed").length;
    const failureCount = executedSteps.filter((entry) => entry.status === "failed").length;

    return {
      executedSteps,
      successCount,
      failureCount,
    };
  }

  private executeStep(step: FixOperationStep): void {
    switch (step.type) {
      case "RemoveUnusedImportsOperation": {
        const sourceFile = this.resolveSourceFile(step.filePath);
        this.removeUnusedImportsOperation.execute(sourceFile);
        return;
      }
      case "OrganizeImportsOperation": {
        const sourceFile = this.resolveSourceFile(step.filePath);
        this.organizeImportsOperation.execute(sourceFile);
        return;
      }
      case "RegisterMissingProviderOperation": {
        const sourceFile = this.resolveSourceFile(step.filePath);
        const providerName = this.readStringData(step, "providerName");
        const importPath = this.readStringData(step, "importPath");

        this.registerMissingProviderOperation.execute({
          sourceFile,
          providerName,
          importPath,
        });
        return;
      }
      case "RegisterMissingControllerOperation": {
        const sourceFile = this.resolveSourceFile(step.filePath);
        const controllerName = this.readStringData(step, "controllerName");
        const importPath = this.readStringData(step, "importPath");

        this.registerMissingControllerOperation.execute({
          sourceFile,
          controllerName,
          importPath,
        });
        return;
      }
      case "FixModuleExportsOperation": {
        const sourceFile = this.resolveSourceFile(step.filePath);
        const exportName = this.readStringData(step, "exportName");
        const importPath = this.readStringData(step, "importPath");

        this.fixModuleExportsOperation.execute({
          sourceFile,
          exportName,
          importPath,
        });
        return;
      }
      case "FixBarrelExportsOperation": {
        const sourceFile = this.resolveOrCreateSourceFile(step.filePath);
        const exportTargets = this.readStringArrayData(step, "exportTargets");

        this.fixBarrelExportsOperation.execute({
          sourceFile,
          exportTargets,
        });
        return;
      }
      default:
        this.assertNever(step.type);
    }
  }

  private resolveSourceFile(filePath: string): SourceFile {
    const sourceFile = this.projectContext.getSourceFile(filePath);

    if (sourceFile === undefined) {
      throw new Error(`Source file not found: ${filePath}`);
    }

    return sourceFile;
  }

  private resolveOrCreateSourceFile(filePath: string): SourceFile {
    const sourceFile = this.projectContext.getSourceFile(filePath);

    if (sourceFile !== undefined) {
      return sourceFile;
    }

    return this.projectContext.getProject().createSourceFile(filePath, "", { overwrite: false });
  }

  private readStringData(step: FixOperationStep, key: string): string {
    const value = step.data?.[key];

    if (typeof value !== "string") {
      throw new Error(`Invalid step data '${key}' for ${step.type}`);
    }

    return value;
  }

  private readStringArrayData(step: FixOperationStep, key: string): string[] {
    const value = step.data?.[key];

    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
      throw new Error(`Invalid step data '${key}' for ${step.type}`);
    }

    return value as string[];
  }

  private assertNever(value: never): never {
    throw new Error(`Unsupported fix operation: ${String(value)}`);
  }
}
