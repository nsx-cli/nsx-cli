import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { GraphBuilder } from './graph-builder';

describe('GraphBuilder', () => {
  it('gera nodes, edges e ciclos', () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    project.createSourceFile(
      '/workspace/src/a.ts',
      'import { b } from "./b"; export const a = b + 1;',
    );
    project.createSourceFile(
      '/workspace/src/b.ts',
      'import { c } from "./c"; export const b = c + 1;',
    );
    project.createSourceFile(
      '/workspace/src/c.ts',
      'import { a } from "./a"; export const c = a + 1;',
    );

    const builder = new GraphBuilder();
    const report = builder.build(project, {
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
    });

    expect(report.statistics.totalNodes).toBe(3);
    expect(report.statistics.totalEdges).toBe(3);
    expect(report.statistics.cycles).toBeGreaterThan(0);
  });
});
