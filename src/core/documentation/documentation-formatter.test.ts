import { describe, expect, it } from 'vitest';
import { DocumentationFormatter } from './documentation-formatter';

describe('DocumentationFormatter', () => {
  it('gera markdown com seções principais', () => {
    const formatter = new DocumentationFormatter();
    const markdown = formatter.format(
      {
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
          usesPrisma: true,
          usesTypeORM: false,
        },
        structure: {
          sourceFiles: 10,
          modules: 1,
          controllers: 2,
          services: 2,
          repositories: 1,
          entities: 1,
          dtos: 3,
        },
        routes: [
          {
            controller: 'UsersController',
            filePath: 'c:/repo/src/users.controller.ts',
            basePath: 'users',
          },
        ],
        prisma: {
          enabled: true,
          schemaPath: 'c:/repo/prisma/schema.prisma',
          models: ['User'],
          enums: ['Role'],
          errors: [],
        },
      },
      'c:/repo/.nsx/documentation.md',
    );

    expect(markdown).toContain('# NSX Project Documentation');
    expect(markdown).toContain('## Structure');
    expect(markdown).toContain('UsersController');
    expect(markdown).toContain('Prisma');
  });
});
