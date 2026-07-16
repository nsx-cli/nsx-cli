import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { AddImportOperation } from './add-import.operation';
import { AddModuleImportOperation } from './add-module-import.operation';
import {
  ensureArrayProperty,
  resolveModuleMetadataObject,
} from './module-metadata.operation-utils';
import { OrganizeImportsOperation } from './organize-imports.operation';

describe('AST operations extra', () => {
  it('adiciona import nomeado/default sem duplicar', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      'file.ts',
      'export const x = 1;',
      { overwrite: true },
    );

    const operation = new AddImportOperation();

    operation.execute({
      sourceFile,
      moduleSpecifier: './dep',
      namedImport: 'Dep',
    });
    operation.execute({
      sourceFile,
      moduleSpecifier: './dep',
      namedImport: 'Dep',
    });
    operation.execute({
      sourceFile,
      moduleSpecifier: './dep',
      defaultImport: 'DefaultDep',
    });

    const declaration = sourceFile.getImportDeclaration(
      (entry) => entry.getModuleSpecifierValue() === './dep',
    );

    expect(
      declaration?.getNamedImports().map((entry) => entry.getName()),
    ).toEqual(['Dep']);
    expect(declaration?.getDefaultImport()?.getText()).toBe('DefaultDep');
  });

  it('adiciona imports no @Module e organiza imports', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      'user.module.ts',
      `import { Module } from "@nestjs/common";

@Module({
  providers: [],
})
export class UserModule {}`,
      { overwrite: true },
    );

    const addModuleImport = new AddModuleImportOperation();

    addModuleImport.execute({
      sourceFile,
      moduleName: 'SharedModule',
      importPath: '../shared/shared.module',
    });
    addModuleImport.execute({
      sourceFile,
      moduleName: 'SharedModule',
      importPath: '../shared/shared.module',
    });

    new OrganizeImportsOperation().execute({ sourceFile });

    const metadata = resolveModuleMetadataObject(sourceFile);
    const importsArray = ensureArrayProperty(metadata, 'imports');

    expect(importsArray.getElements().map((entry) => entry.getText())).toEqual([
      'SharedModule',
    ]);
    expect(sourceFile.getFullText()).toContain('../shared/shared.module');
  });

  it('falha quando não encontra classe com @Module', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      'plain.ts',
      'export class Plain {}',
      { overwrite: true },
    );

    expect(() => resolveModuleMetadataObject(sourceFile)).toThrow(
      'Module class with @Module decorator was not found',
    );
  });
});
