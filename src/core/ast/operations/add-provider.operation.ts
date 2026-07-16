import { SourceFile } from "ts-morph";
import { ensureArrayProperty, ensureNamedImport, resolveModuleMetadataObject } from "./module-metadata.operation-utils";

export interface AddProviderOperationInput {
  sourceFile: SourceFile;
  providerName: string;
  importPath: string;
}

export class AddProviderOperation {
  public execute(input: AddProviderOperationInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const providersArray = ensureArrayProperty(metadataObject, "providers");

    const alreadyExists = providersArray
      .getElements()
      .some((element) => element.getText().trim() === input.providerName);

    if (alreadyExists) {
      ensureNamedImport(input.sourceFile, input.providerName, input.importPath);
      return;
    }

    providersArray.addElement(input.providerName);
    ensureNamedImport(input.sourceFile, input.providerName, input.importPath);
  }
}
