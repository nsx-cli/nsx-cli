import { SourceFile } from 'ts-morph';
import {
  ensureArrayProperty,
  ensureNamedImport,
  resolveModuleMetadataObject,
} from './module-metadata.operation-utils';

export interface AddProviderOperationInput {
  sourceFile: SourceFile;
  providerName: string;
  importPath: string;
}

export class AddProviderOperation {
  execute(input: AddProviderOperationInput): void {
    ensureNamedImport(input.sourceFile, input.providerName, input.importPath);

    const metadata = resolveModuleMetadataObject(input.sourceFile);
    const providers = ensureArrayProperty(metadata, 'providers');

    const exists = providers
      .getElements()
      .some((e) => e.getText().trim() === input.providerName);

    if (!exists) {
      providers.addElement(input.providerName);
    }
  }
}
