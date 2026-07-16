import { describe, expect, it } from 'vitest';
import { DocumentationService } from './documentation.service';

describe('DocumentationService', () => {
  it('gera markdown e grava arquivo de saída', async () => {
    const collector = {
      collect: async () => ({
        generatedAt: '2026-07-14T00:00:00.000Z',
        project: {
          rootDir: 'c:/repo',
          packageJsonPath: null,
          tsconfigPath: null,
          nestCliPath: null,
          packageJson: null,
          tsconfig: null,
          nestCli: null,
          isNestJs: true,
          usesPrisma: false,
          usesTypeORM: false,
        },
        structure: {
          sourceFiles: 1,
          modules: 0,
          controllers: 0,
          services: 0,
          repositories: 0,
          entities: 0,
          dtos: 0,
        },
        routes: [],
        prisma: {
          enabled: false,
          models: [],
          enums: [],
          errors: [],
        },
      }),
    };

    const formatter = {
      format: () => '# docs',
    };

    const fileService = {
      ensureDirectory: async () => undefined,
      writeFile: async () => undefined,
    };

    const service = new DocumentationService(
      collector as never,
      formatter as never,
      fileService as never,
    );
    const result = await service.generate({ outputPath: 'c:/repo/docs.md' });

    expect(result.outputPath).toBe('c:/repo/docs.md');
    expect(result.markdown).toBe('# docs');
  });
});
