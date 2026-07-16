import { describe, expect, it } from 'vitest';
import { DocumentationCollector } from './documentation-collector';

describe('DocumentationCollector', () => {
  it('coleta snapshot com estrutura e prisma', async () => {
    const scanner = {
      scan: async () => ({
        rootDir: process.cwd(),
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: true,
        usesTypeORM: false,
      }),
    };

    const fileService = {
      find: async () => [],
    };

    const prismaLoader = {
      load: async () => ({
        path: 'c:/repo/prisma/schema.prisma',
        content: 'model User { id Int @id }',
      }),
    };

    const prismaDmmf = {
      generate: async () => ({
        datamodel: {
          models: [{ name: 'User' }],
          enums: [{ name: 'Role' }],
        },
      }),
    };

    const collector = new DocumentationCollector(
      scanner as never,
      fileService as never,
      prismaLoader as never,
      prismaDmmf as never,
    );
    const snapshot = await collector.collect();

    expect(snapshot.project.isNestJs).toBe(true);
    expect(snapshot.prisma.models).toEqual(['User']);
    expect(snapshot.prisma.enums).toEqual(['Role']);
  });
});
