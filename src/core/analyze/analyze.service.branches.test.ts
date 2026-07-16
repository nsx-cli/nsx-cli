import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { AnalyzeService } from './analyze.service';

describe('AnalyzeService branches', () => {
  it('usa tsconfig quando existe', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'nsx-analyze-tsconfig-'),
    );
    const tsconfigPath = path.join(tempRoot, 'tsconfig.json');
    await writeFile(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: { target: 'ES2020', module: 'CommonJS' },
      }),
    );

    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: tempRoot,
        packageJsonPath: null,
        tsconfigPath,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const analyzer = {
      analyze: vi.fn().mockResolvedValue({
        generatedAt: new Date().toISOString(),
        project: await scanner.scan(),
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

    const formatter = {
      format: vi.fn().mockReturnValue('# analyze'),
    };

    const fileService = {
      find: vi.fn().mockResolvedValue([]),
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    const service = new AnalyzeService(
      scanner as never,
      analyzer as never,
      formatter as never,
      fileService as never,
    );

    await service.run({
      outputPath: path.join(tempRoot, '.nsx', 'analyze.md'),
    });

    expect(fileService.find).not.toHaveBeenCalled();
    expect(fileService.writeFile).toHaveBeenCalledTimes(1);
  });

  it('varre src quando não existe tsconfig', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'nsx-analyze-scan-'));
    const srcDir = path.join(tempRoot, 'src');

    await mkdir(srcDir, { recursive: true });
    await writeFile(path.join(srcDir, 'a.ts'), 'export const a = 1;');
    await writeFile(path.join(srcDir, 'b.d.ts'), 'declare const b: string;');

    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: tempRoot,
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const analyzer = {
      analyze: vi.fn().mockResolvedValue({
        generatedAt: new Date().toISOString(),
        project: await scanner.scan(),
        sections: [],
        statistics: {
          sourceFiles: 1,
          averageComplexity: 0,
          averageCoupling: 0,
          averageCohesion: 0,
          highComplexityFiles: 0,
        },
      }),
    };

    const formatter = {
      format: vi.fn().mockReturnValue('# analyze'),
    };

    const fileService = {
      find: vi
        .fn()
        .mockResolvedValue([
          path.join(srcDir, 'a.ts'),
          path.join(srcDir, 'b.d.ts'),
        ]),
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    const service = new AnalyzeService(
      scanner as never,
      analyzer as never,
      formatter as never,
      fileService as never,
    );

    const result = await service.run();

    expect(result.outputPath).toContain(path.join('.nsx', 'analyze-report.md'));
    expect(fileService.find).toHaveBeenCalledTimes(1);
  });
});
