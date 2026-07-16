import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ExecutionPlan, FixOperationStep } from './fix-result';
import { FixExecutor } from './fix-executor';

function createModuleSource(project: Project) {
  return project.createSourceFile(
    '/repo/src/modules/user/user.module.ts',
    `import { Module } from "@nestjs/common";

@Module({
  providers: [],
  controllers: [],
  exports: [],
})
export class UserModule {}`,
    { overwrite: true },
  );
}

describe('FixExecutor', () => {
  it('executa todas operações com sucesso', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const moduleFile = createModuleSource(project);

    const projectContext = {
      getSourceFile: (filePath: string) =>
        filePath.endsWith('user.module.ts') ? moduleFile : undefined,
      getProject: () => project,
    };

    const plan = new ExecutionPlan([
      {
        type: 'RegisterMissingProviderOperation',
        filePath: '/repo/src/modules/user/user.module.ts',
        description: 'provider',
        data: { providerName: 'UserService', importPath: './user.service' },
      },
      {
        type: 'RegisterMissingControllerOperation',
        filePath: '/repo/src/modules/user/user.module.ts',
        description: 'controller',
        data: {
          controllerName: 'UserController',
          importPath: './user.controller',
        },
      },
      {
        type: 'FixModuleExportsOperation',
        filePath: '/repo/src/modules/user/user.module.ts',
        description: 'exports',
        data: { exportName: 'UserService', importPath: './user.service' },
      },
      {
        type: 'OrganizeImportsOperation',
        filePath: '/repo/src/modules/user/user.module.ts',
        description: 'organize',
      },
      {
        type: 'RemoveUnusedImportsOperation',
        filePath: '/repo/src/modules/user/user.module.ts',
        description: 'remove-unused',
      },
      {
        type: 'FixBarrelExportsOperation',
        filePath: '/repo/src/modules/user/index.ts',
        description: 'barrel',
        data: { exportTargets: ['./user.service', './user.controller'] },
      },
    ]);

    const result = new FixExecutor(projectContext as never).execute(plan);

    const moduleText = moduleFile.getFullText();
    const barrel = project.getSourceFile('/repo/src/modules/user/index.ts');

    expect(result.successCount).toBe(6);
    expect(result.failureCount).toBe(0);
    expect(moduleText).toContain('providers: [UserService]');
    expect(moduleText).toContain('controllers: [UserController]');
    expect(moduleText).toContain('exports: [UserService]');
    expect(
      barrel
        ?.getExportDeclarations()
        .map((entry) => entry.getModuleSpecifierValue()),
    ).toEqual(['./user.service', './user.controller']);
  });

  it('captura falhas por arquivo ausente e dados inválidos', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const moduleFile = createModuleSource(project);

    const projectContext = {
      getSourceFile: (filePath: string) =>
        filePath.endsWith('user.module.ts') ? moduleFile : undefined,
      getProject: () => project,
    };

    const invalidStep = {
      type: 'RegisterMissingProviderOperation',
      filePath: '/repo/src/modules/user/user.module.ts',
      description: 'provider sem dados',
      data: { providerName: true as unknown as string },
    } as unknown as FixOperationStep;

    const unsupported = {
      type: 'UnsupportedOperation',
      filePath: '/repo/src/modules/user/user.module.ts',
      description: 'unsupported',
    } as unknown as FixOperationStep;

    const plan = new ExecutionPlan([
      {
        type: 'OrganizeImportsOperation',
        filePath: '/repo/src/modules/missing/missing.module.ts',
        description: 'missing',
      },
      invalidStep,
      unsupported,
    ]);

    const result = new FixExecutor(projectContext as never).execute(plan);

    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(3);
    expect(
      result.executedSteps.some((entry) =>
        (entry.error ?? '').includes('Source file not found'),
      ),
    ).toBe(true);
    expect(
      result.executedSteps.some((entry) =>
        (entry.error ?? '').includes('Invalid step data'),
      ),
    ).toBe(true);
    expect(
      result.executedSteps.some((entry) =>
        (entry.error ?? '').includes('Unsupported fix operation'),
      ),
    ).toBe(true);
  });
});
