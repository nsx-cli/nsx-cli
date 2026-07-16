import { ImportDeclarationStructure, OptionalKind, SourceFile } from 'ts-morph';

export interface PlanNamedImportOptions {
  sourceFile: SourceFile;
  moduleSpecifier: string;
  namedImport: string;
}

export interface PlanDefaultImportOptions {
  sourceFile: SourceFile;
  moduleSpecifier: string;
  defaultImport: string;
}

export class AstImportPlanner {
  public planNamedImport(
    options: PlanNamedImportOptions,
  ): OptionalKind<ImportDeclarationStructure> {
    const existing = options.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === options.moduleSpecifier,
    );

    const namedImports =
      existing
        ?.getNamedImports()
        .map((entry) => entry.getName())
        .filter((entry) => entry !== options.namedImport) ?? [];

    return {
      moduleSpecifier: options.moduleSpecifier,
      defaultImport: existing?.getDefaultImport()?.getText() ?? undefined,
      namedImports: [...namedImports, options.namedImport].sort(
        (first, second) => first.localeCompare(second),
      ),
    };
  }

  public planDefaultImport(
    options: PlanDefaultImportOptions,
  ): OptionalKind<ImportDeclarationStructure> {
    const existing = options.sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === options.moduleSpecifier,
    );

    return {
      moduleSpecifier: options.moduleSpecifier,
      defaultImport: options.defaultImport,
      namedImports:
        existing?.getNamedImports().map((entry) => entry.getName()) ?? [],
    };
  }
}
