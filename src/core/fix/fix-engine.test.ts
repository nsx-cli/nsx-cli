import { Project } from 'ts-morph';
import { describe, expect, it, vi } from 'vitest';
import { ExecutionPlan } from './fix-result';
import { FixEngine } from './fix-engine';

describe('FixEngine', () => {
  it('executa plano quando dryRun = false', async () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });
    project.createSourceFile(
      '/workspace/src/modules/user/user.module.ts',
      'export class UserModule {}',
    );

    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: '/workspace',
        packageJsonPath: '/workspace/package.json',
        tsconfigPath: '/workspace/tsconfig.json',
        nestCliPath: null,
        packageJson: {},
        tsconfig: {},
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const projectContext = {
      open: vi.fn().mockReturnValue(project),
      saveProject: vi.fn().mockResolvedValue(undefined),
    };

    const analyzeEngine = {
      analyze: vi.fn().mockResolvedValue({
        generatedAt: new Date().toISOString(),
        project: {
          rootDir: '/workspace',
          packageJsonPath: '/workspace/package.json',
          tsconfigPath: '/workspace/tsconfig.json',
          nestCliPath: null,
          packageJson: {},
          tsconfig: {},
          nestCli: null,
          isNestJs: true,
          usesPrisma: false,
          usesTypeORM: false,
        },
        sections: [],
        statistics: {
          sourceFiles: 1,
          averageComplexity: 1,
          averageCoupling: 1,
          averageCohesion: 100,
          highComplexityFiles: 0,
        },
      }),
    };

    const planner = {
      plan: vi.fn().mockReturnValue(
        new ExecutionPlan([
          {
            type: 'OrganizeImportsOperation',
            filePath: '/workspace/src/modules/user/user.module.ts',
            description: 'Organizar imports',
          },
        ]),
      ),
    };

    const executor = {
      execute: vi.fn().mockReturnValue({
        executedSteps: [
          {
            step: {
              type: 'OrganizeImportsOperation',
              filePath: '/workspace/src/modules/user/user.module.ts',
              description: 'Organizar imports',
            },
            status: 'executed',
          },
        ],
        successCount: 1,
        failureCount: 0,
      }),
    };

    const formatter = {
      formatMarkdown: vi.fn().mockReturnValue('# report'),
      formatPreview: vi.fn().mockReturnValue('preview'),
    };

    const fileService = {
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    const engine = new FixEngine(
      scanner as never,
      projectContext as never,
      analyzeEngine as never,
      planner as never,
      executor as never,
      formatter as never,
      fileService as never,
    );

    const result = await engine.run();

    expect(projectContext.open).toHaveBeenCalledWith({
      tsConfigFilePath: '/workspace/tsconfig.json',
    });
    expect(executor.execute).toHaveBeenCalledTimes(1);
    expect(projectContext.saveProject).toHaveBeenCalledTimes(1);
    expect(result.preview).toBe('preview');
  });

  it('não executa plano quando dryRun = true', async () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: '/workspace',
        packageJsonPath: '/workspace/package.json',
        tsconfigPath: '/workspace/tsconfig.json',
        nestCliPath: null,
        packageJson: {},
        tsconfig: {},
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const projectContext = {
      open: vi.fn().mockReturnValue(project),
      saveProject: vi.fn().mockResolvedValue(undefined),
    };

    const analyzeEngine = {
      analyze: vi.fn().mockResolvedValue({
        generatedAt: new Date().toISOString(),
        project: {
          rootDir: '/workspace',
          packageJsonPath: '/workspace/package.json',
          tsconfigPath: '/workspace/tsconfig.json',
          nestCliPath: null,
          packageJson: {},
          tsconfig: {},
          nestCli: null,
          isNestJs: true,
          usesPrisma: false,
          usesTypeORM: false,
        },
        sections: [],
        statistics: {
          sourceFiles: 0,
          averageComplexity: 0,
          averageCoupling: 0,
          averageCohesion: 0,
          highComplexityFiles: 0,
        },
      }),
    };

    const planner = {
      plan: vi.fn().mockReturnValue(new ExecutionPlan([])),
    };

    const executor = {
      execute: vi.fn(),
    };

    const formatter = {
      formatMarkdown: vi.fn().mockReturnValue('# report'),
      formatPreview: vi.fn().mockReturnValue('preview'),
    };

    const fileService = {
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    const engine = new FixEngine(
      scanner as never,
      projectContext as never,
      analyzeEngine as never,
      planner as never,
      executor as never,
      formatter as never,
      fileService as never,
    );

    const result = await engine.run({ dryRun: true });

    expect(executor.execute).not.toHaveBeenCalled();
    expect(projectContext.saveProject).not.toHaveBeenCalled();
    expect(result.report.summary.dryRun).toBe(true);
  });
});
