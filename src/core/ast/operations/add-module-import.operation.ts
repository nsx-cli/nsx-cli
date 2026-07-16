import { SourceFile } from "ts-morph";
import { ensureArrayProperty, resolveModuleMetadataObject } from "./module-metadata.operation-utils";

export interface AddModuleImportOperationInput {
  sourceFile: SourceFile;
  moduleName: string;
  importPath: string;
}

export class AddModuleImportOperation {
  public execute(input: AddModuleImportOperationInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const importsArray = ensureArrayProperty(metadataObject, "imports");
    const exists = importsArray.getElements().some((entry) => entry.getText().trim() === input.moduleName);

    if (!exists) {
      importsArray.addElement(input.moduleName);
    }

    const declaration = input.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === input.importPath
    );

    if (declaration === undefined) {
      input.sourceFile.addImportDeclaration({
        moduleSpecifier: input.importPath,
        namedImports: [input.moduleName],
      });
      return;
    }

    const hasNamedImport = declaration.getNamedImports().some((entry) => entry.getName() === input.moduleName);

    if (!hasNamedImport) {
      declaration.addNamedImport(input.moduleName);
    }
  }
}
