import { SourceFile } from "ts-morph";
import { ensureArrayProperty, ensureNamedImport, resolveModuleMetadataObject } from "./module-metadata.operation-utils";

export interface AddControllerOperationInput {
  sourceFile: SourceFile;
  controllerName: string;
  importPath: string;
}

export class AddControllerOperation {
  public execute(input: AddControllerOperationInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const controllersArray = ensureArrayProperty(metadataObject, "controllers");

    const alreadyExists = controllersArray
      .getElements()
      .some((element) => element.getText().trim() === input.controllerName);

    if (alreadyExists) {
      ensureNamedImport(input.sourceFile, input.controllerName, input.importPath);
      return;
    }

    controllersArray.addElement(input.controllerName);
    ensureNamedImport(input.sourceFile, input.controllerName, input.importPath);
  }
}
