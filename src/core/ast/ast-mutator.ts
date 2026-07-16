import { ImportDeclaration, SourceFile } from 'ts-morph';
import { AstImportPlanner } from './ast-import-planner';
import {
  ensureArrayProperty,
  resolveModuleMetadataObject,
} from './operations/module-metadata.operation-utils';

export interface AddImportOptions {
  sourceFile: SourceFile;
  moduleSpecifier: string;
  namedImport?: string;
  defaultImport?: string;
}

export interface AddProviderOptions {
  moduleSourceFile: SourceFile;
  providerName: string;
}

export interface AddControllerOptions {
  moduleSourceFile: SourceFile;
  controllerName: string;
}

export class AstMutator {
  constructor(private readonly importPlanner: AstImportPlanner) {}

  public addImport(options: AddImportOptions): ImportDeclaration {
    const existing = options.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === options.moduleSpecifier,
    );

    if (existing !== undefined) {
      if (
        options.defaultImport !== undefined &&
        existing.getDefaultImport() === undefined
      ) {
        existing.setDefaultImport(options.defaultImport);
      }

      if (options.namedImport !== undefined) {
        const hasNamedImport = existing
          .getNamedImports()
          .some((entry) => entry.getName() === options.namedImport);

        if (!hasNamedImport) {
          existing.addNamedImport(options.namedImport);
        }
      }

      return existing;
    }

    if (options.namedImport !== undefined) {
      const planned = this.importPlanner.planNamedImport({
        sourceFile: options.sourceFile,
        moduleSpecifier: options.moduleSpecifier,
        namedImport: options.namedImport,
      });

      return options.sourceFile.addImportDeclaration(planned);
    }

    if (options.defaultImport !== undefined) {
      const planned = this.importPlanner.planDefaultImport({
        sourceFile: options.sourceFile,
        moduleSpecifier: options.moduleSpecifier,
        defaultImport: options.defaultImport,
      });

      return options.sourceFile.addImportDeclaration(planned);
    }

    return options.sourceFile.addImportDeclaration({
      moduleSpecifier: options.moduleSpecifier,
    });
  }

  public addProvider(options: AddProviderOptions): void {
    const metadataObject = resolveModuleMetadataObject(
      options.moduleSourceFile,
    );
    const providers = ensureArrayProperty(metadataObject, 'providers');
    const exists = providers
      .getElements()
      .some((entry) => entry.getText().trim() === options.providerName);

    if (!exists) {
      providers.addElement(options.providerName);
    }
  }

  public addController(options: AddControllerOptions): void {
    const metadataObject = resolveModuleMetadataObject(
      options.moduleSourceFile,
    );
    const controllers = ensureArrayProperty(metadataObject, 'controllers');
    const exists = controllers
      .getElements()
      .some((entry) => entry.getText().trim() === options.controllerName);

    if (!exists) {
      controllers.addElement(options.controllerName);
    }
  }
}
