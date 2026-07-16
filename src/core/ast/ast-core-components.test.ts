import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { AstImportPlanner } from './ast-import-planner';
import { AstLocator } from './ast-locator';
import { AstMutator } from './ast-mutator';
import { AstProjectContext } from './ast-project-context';

describe('AST core components', () => {
  it('cobre planner, mutator e locator', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      'user.module.ts',
      `import { Module } from "@nestjs/common";

@Module({
  providers: [],
  controllers: [],
})
export class UserModule {}`,
      { overwrite: true },
    );

    const planner = new AstImportPlanner();
    const mutator = new AstMutator(planner);

    const plannedNamed = planner.planNamedImport({
      sourceFile,
      moduleSpecifier: './a',
      namedImport: 'A',
    });
    const plannedDefault = planner.planDefaultImport({
      sourceFile,
      moduleSpecifier: './b',
      defaultImport: 'B',
    });

    expect(plannedNamed.namedImports).toEqual(['A']);
    expect(plannedDefault.defaultImport).toBe('B');

    mutator.addImport({
      sourceFile,
      moduleSpecifier: './dep',
      namedImport: 'Dep',
    });
    mutator.addImport({
      sourceFile,
      moduleSpecifier: './dep',
      defaultImport: 'DefaultDep',
    });
    mutator.addProvider({
      moduleSourceFile: sourceFile,
      providerName: 'UserService',
    });
    mutator.addController({
      moduleSourceFile: sourceFile,
      controllerName: 'UserController',
    });

    const locator = new AstLocator({
      getSourceFile: () => sourceFile,
    } as never);

    expect(locator.findSourceFile({ filePath: 'user.module.ts' })).toBe(
      sourceFile,
    );
    expect(
      locator.findClass({ sourceFile, className: 'UserModule' })?.getName(),
    ).toBe('UserModule');
    expect(locator.findModule({ sourceFile })?.getName()).toBe('UserModule');
    expect(
      locator.findDecorator({
        target: sourceFile.getClassOrThrow('UserModule'),
        decoratorName: 'Module',
      }),
    ).toBeDefined();
    expect(
      locator.findDecorator({ target: sourceFile, decoratorName: 'Module' }),
    ).toBeDefined();

    const text = sourceFile.getFullText();
    expect(text).toContain('UserService');
    expect(text).toContain('UserController');
  });

  it('cobre branches de import existente e lookup de módulo por nome', () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });
    const sourceFile = project.createSourceFile(
      'user.module.ts',
      `import { Module } from "@nestjs/common";
import { Existing } from "./existing";

@Module({
  providers: [],
})
export class UserModule {}`,
      { overwrite: true },
    );

    const planner = new AstImportPlanner();
    const mutator = new AstMutator(planner);

    mutator.addImport({
      sourceFile,
      moduleSpecifier: './existing',
      namedImport: 'Existing',
    });
    mutator.addImport({
      sourceFile,
      moduleSpecifier: './existing',
      defaultImport: 'DefaultExisting',
    });

    const locator = new AstLocator({
      getSourceFile: () => sourceFile,
    } as never);

    expect(
      locator.findModule({ sourceFile, className: 'UserModule' })?.getName(),
    ).toBe('UserModule');
    expect(
      sourceFile
        .getImportDeclaration(
          (entry) => entry.getModuleSpecifierValue() === './existing',
        )
        ?.getDefaultImport()
        ?.getText(),
    ).toBe('DefaultExisting');
  });

  it('cobre AstProjectContext com open/get/save', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'nsx-ast-context-'));
    const srcDir = path.join(tempRoot, 'src');
    await mkdir(srcDir, { recursive: true });
    await writeFile(path.join(srcDir, 'sample.ts'), 'export const sample = 1;');
    await writeFile(
      path.join(tempRoot, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { target: 'ES2020', module: 'CommonJS' },
        include: ['src/**/*.ts'],
      }),
    );

    const context = new AstProjectContext();
    context.open({ tsConfigFilePath: path.join(tempRoot, 'tsconfig.json') });

    const sourceFile = context.getSourceFile(path.join(srcDir, 'sample.ts'));

    expect(sourceFile).toBeDefined();
    expect(context.getSourceFiles().length).toBeGreaterThan(0);
    expect(context.getDirectory(srcDir)?.getPath()).toContain(
      srcDir.replace(/\\/g, '/'),
    );

    await context.saveProject();
  });

  it('lança erro ao acessar projeto antes de open', () => {
    const context = new AstProjectContext();

    expect(() => context.getProject()).toThrow('Project is not initialized');
  });
});
