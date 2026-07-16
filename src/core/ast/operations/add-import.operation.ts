import { SourceFile } from "ts-morph";

export interface AddImportOperationInput {
  sourceFile: SourceFile;
  moduleSpecifier: string;
  namedImport?: string;
  defaultImport?: string;
}

export class AddImportOperation {
  public execute(input: AddImportOperationInput): void {
    const declaration = input.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === input.moduleSpecifier
    );

    if (declaration === undefined) {
      input.sourceFile.addImportDeclaration({
        moduleSpecifier: input.moduleSpecifier,
        namedImports: input.namedImport ? [input.namedImport] : [],
        defaultImport: input.defaultImport,
      });
      return;
    }

    if (input.defaultImport !== undefined && declaration.getDefaultImport() === undefined) {
      declaration.setDefaultImport(input.defaultImport);
    }

    if (input.namedImport !== undefined) {
      const hasNamedImport = declaration.getNamedImports().some((entry) => entry.getName() === input.namedImport);

      if (!hasNamedImport) {
        declaration.addNamedImport(input.namedImport);
      }
    }
  }
}
