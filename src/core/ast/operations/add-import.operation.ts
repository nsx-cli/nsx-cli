import { SourceFile } from 'ts-morph';

export interface AddImportOperationOptions {
  sourceFile: SourceFile;
  moduleSpecifier: string;
  namedImport?: string;
  defaultImport?: string;
}

export class AddImportOperation {
  execute(options: AddImportOperationOptions): void {
    const { sourceFile, moduleSpecifier, namedImport, defaultImport } = options;

    const existing = sourceFile
      .getImportDeclarations()
      .find((i) => i.getModuleSpecifierValue() === moduleSpecifier);

    if (existing) {
      if (
        namedImport &&
        !existing.getNamedImports().some((n) => n.getName() === namedImport)
      ) {
        existing.addNamedImport(namedImport);
      }

      if (defaultImport && !existing.getDefaultImport()) {
        existing.setDefaultImport(defaultImport);
      }

      return;
    }

    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: namedImport ? [namedImport] : [],
      defaultImport,
    });
  }
}
