import { SourceFile } from 'ts-morph';
import {
  ensureArrayProperty,
  resolveModuleMetadataObject,
} from './module-metadata.operation-utils';

export interface RemoveProviderOperationInput {
  sourceFile: SourceFile;
  providerName: string;
}

export class RemoveProviderOperation {
  public execute(input: RemoveProviderOperationInput): void {
    const metadataObject = resolveModuleMetadataObject(input.sourceFile);
    const providersArray = ensureArrayProperty(metadataObject, 'providers');
    const indexesToRemove: number[] = [];

    for (const [index, element] of providersArray.getElements().entries()) {
      if (element.getText().trim() === input.providerName) {
        indexesToRemove.push(index);
      }
    }

    for (const index of indexesToRemove.sort(
      (first, second) => second - first,
    )) {
      providersArray.removeElement(index);
    }
  }
}
