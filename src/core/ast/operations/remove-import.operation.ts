import { SourceFile } from "ts-morph";

export interface RemoveImportOperationInput {
  sourceFile: SourceFile;
  moduleSpecifier: string;
}

export class RemoveImportOperation {
  public execute(input: RemoveImportOperationInput): void {
    const declaration = input.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === input.moduleSpecifier
    );

    declaration?.remove();
  }
}
