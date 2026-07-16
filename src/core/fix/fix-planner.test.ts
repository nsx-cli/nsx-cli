import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { FixPlanner } from './fix-planner';

describe('FixPlanner', () => {
  it('cria plano com operações para provider/controller/exports/barrel', () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    project.createSourceFile(
      '/workspace/src/modules/user/user.module.ts',
      `import { Module } from "@nestjs/common";

@Module({
  providers: [],
  controllers: [],
})
export class UserModule {}`,
    );
    project.createSourceFile(
      '/workspace/src/modules/user/user.service.ts',
      `export class UserService {}`,
    );
    project.createSourceFile(
      '/workspace/src/modules/user/user.controller.ts',
      `export class UserController {}`,
    );

    const planner = new FixPlanner();
    const plan = planner.plan(project, {
      generatedAt: new Date().toISOString(),
      project: {
        rootDir: '/workspace',
        packageJsonPath: null,
        tsconfigPath: '/workspace/tsconfig.json',
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      },
      sections: [],
      statistics: {
        sourceFiles: 3,
        averageComplexity: 1,
        averageCoupling: 1,
        averageCohesion: 100,
        highComplexityFiles: 0,
      },
    });

    const steps = plan.getSteps();

    expect(
      steps.some((step) => step.type === 'RegisterMissingProviderOperation'),
    ).toBe(true);
    expect(
      steps.some((step) => step.type === 'RegisterMissingControllerOperation'),
    ).toBe(true);
    expect(
      steps.some((step) => step.type === 'FixModuleExportsOperation'),
    ).toBe(true);
    expect(
      steps.some((step) => step.type === 'FixBarrelExportsOperation'),
    ).toBe(true);
    expect(steps.some((step) => step.type === 'OrganizeImportsOperation')).toBe(
      true,
    );
    expect(
      steps.some((step) => step.type === 'RemoveUnusedImportsOperation'),
    ).toBe(true);

    const modulePath = '/workspace/src/modules/user/user.module.ts';
    const providerStep = steps.find(
      (step) => step.type === 'RegisterMissingProviderOperation',
    );

    expect(providerStep?.filePath.replace(/\\/g, '/')).toBe(modulePath);
    expect(providerStep?.data?.importPath).toBe('./user.service');
  });
});
