import { SourceFile } from "ts-morph";
import { ensureArrayProperty, resolveModuleMetadataObject } from "./module-metadata.operation-utils";

export interface RemoveControllerOperationInput {
  sourceFile: SourceFile;
  controllerName: string;
}

export class RemoveControllerOperation {
  public execute(input: RemoveControllerOperationInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const controllersArray = ensureArrayProperty(metadataObject, "controllers");
    const indexesToRemove: number[] = [];

    for (const [index, element] of controllersArray.getElements().entries()) {
      if (element.getText().trim() === input.controllerName) {
        indexesToRemove.push(index);
      }
    }

    for (const index of indexesToRemove.sort((first, second) => second - first)) {
      controllersArray.removeElement(index);
    }
  }
}
