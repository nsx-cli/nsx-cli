import { SourceFile } from 'ts-morph';
import {
  ensureArrayProperty,
  ensureNamedImport,
  resolveModuleMetadataObject,
} from './module-metadata.operation-utils';

export interface AddControllerOperationInput {
  sourceFile: SourceFile;
  controllerName: string;
  importPath: string;
}

export class AddControllerOperation {
  execute(input: AddControllerOperationInput): void {
    ensureNamedImport(input.sourceFile, input.controllerName, input.importPath);

    const metadata = resolveModuleMetadataObject(input.sourceFile);
    const providers = ensureArrayProperty(metadata, 'controllers');

    const exists = providers
      .getElements()
      .some((e) => e.getText().trim() === input.controllerName);

    if (!exists) {
      providers.addElement(input.controllerName);
    }
  }
}
