import { Project } from 'ts-morph';
import { describe, expect, it, vi } from 'vitest';
import { AstImportPlanner } from './ast-import-planner';
import { AstLocator } from './ast-locator';
import { AstMutator } from './ast-mutator';
import { AstPersistenceService } from './ast-persistence.service';
import { AstProjectContext } from './ast-project-context';
import { AstService } from './ast-service';

describe('AstService', () => {
  it('adiciona import/provider/controller no modulo', () => {
    const projectContext = new AstProjectContext();
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });
    const sourceFile = project.createSourceFile(
      '/workspace/src/modules/users/users.module.ts',
      `import { Module } from "@nestjs/common";

@Module({
  providers: [],
  controllers: [],
})
export class UsersModule {}`,
    );

    projectContext.open = () => project;
    projectContext.getSourceFile = (filePath: string) =>
      filePath === sourceFile.getFilePath() ? sourceFile : undefined;

    const service = new AstService(
      projectContext,
      new AstLocator(projectContext),
      new AstMutator(new AstImportPlanner()),
      new AstPersistenceService(projectContext),
    );

    service.addImport({
      sourceFile,
      moduleSpecifier: './users.service',
      namedImport: 'UsersService',
    });
    service.addProvider({
      moduleSourceFile: sourceFile,
      providerName: 'UsersService',
    });
    service.addController({
      moduleSourceFile: sourceFile,
      controllerName: 'UsersController',
    });

    const content = sourceFile.getFullText();
    expect(content).toContain('import { UsersService } from "./users.service"');
    expect(content).toContain('providers: [UsersService]');
    expect(content).toContain('controllers: [UsersController]');
  });

  it('expõe wrappers de project context, locator e persistence', async () => {
    const projectContext = new AstProjectContext();
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });
    const sourceFile = project.createSourceFile(
      '/workspace/src/modules/users/users.module.ts',
      `import { Module } from "@nestjs/common";

@Module({})
export class UsersModule {}`,
      { overwrite: true },
    );

    projectContext.open = () => project;
    projectContext.getSourceFile = (filePath: string) =>
      filePath === sourceFile.getFilePath() ? sourceFile : undefined;
    projectContext.getSourceFiles = () => [sourceFile];
    projectContext.getDirectory = () =>
      project.getDirectoryOrThrow('/workspace/src/modules/users');
    projectContext.saveProject = vi.fn().mockResolvedValue(undefined);

    const saveSpy = vi.spyOn(sourceFile, 'save').mockResolvedValue(undefined);

    const service = new AstService(
      projectContext,
      new AstLocator(projectContext),
      new AstMutator(new AstImportPlanner()),
      new AstPersistenceService(projectContext),
    );

    service.openProject({ tsConfigFilePath: '/workspace/tsconfig.json' });

    expect(service.findSourceFile({ filePath: sourceFile.getFilePath() })).toBe(
      sourceFile,
    );
    expect(
      service.findClass({ sourceFile, className: 'UsersModule' })?.getName(),
    ).toBe('UsersModule');
    expect(
      service.findDecorator({
        target: sourceFile.getClassOrThrow('UsersModule'),
        decoratorName: 'Module',
      }),
    ).toBeDefined();
    expect(service.findModule({ sourceFile })?.getName()).toBe('UsersModule');

    await service.save(sourceFile);
    await service.saveAll();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(projectContext.saveProject).toHaveBeenCalledTimes(1);
  });
});
