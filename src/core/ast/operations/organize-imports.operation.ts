import { SourceFile } from "ts-morph";

export interface OrganizeImportsOperationInput {
  sourceFile: SourceFile;
}

export class OrganizeImportsOperation {
  public execute(input: OrganizeImportsOperationInput): void {
    input.sourceFile.organizeImports();
  }
}
