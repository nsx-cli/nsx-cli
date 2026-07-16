import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { GraphService } from "./graph.service";

describe("GraphService", () => {
  it("gera relatorio graph e persiste markdown", async () => {
    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: "c:/repo",
        packageJsonPath: null,
        tsconfigPath: "c:/repo/tsconfig.json",
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const project = {};
    const projectContext = {
      open: vi.fn().mockReturnValue(project),
    };

    const builder = {
      build: vi.fn().mockReturnValue({
        generatedAt: new Date().toISOString(),
        project: {
          rootDir: "c:/repo",
          packageJsonPath: null,
          tsconfigPath: "c:/repo/tsconfig.json",
          nestCliPath: null,
          packageJson: null,
          tsconfig: null,
          nestCli: null,
          isNestJs: true,
          usesPrisma: false,
          usesTypeORM: false,
        },
        nodes: [],
        edges: [],
        cycles: [],
        statistics: {
          totalNodes: 0,
          totalEdges: 0,
          cycles: 0,
        },
      }),
    };

    const formatter = {
      format: vi.fn().mockReturnValue("# graph"),
    };

    const fileService = {
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      find: vi.fn().mockResolvedValue([]),
    };

    const service = new GraphService(
      scanner as never,
      projectContext as never,
      builder as never,
      formatter as never,
      fileService as never
    );

    const result = await service.run({ outputPath: "c:/repo/.nsx/graph-report.md" });

    expect(projectContext.open).toHaveBeenCalledWith({ tsConfigFilePath: "c:/repo/tsconfig.json" });
    expect(result.outputPath).toBe("c:/repo/.nsx/graph-report.md");
    expect(result.markdown).toBe("# graph");
  });

  it("usa scan direto quando não existe tsconfig", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "nsx-graph-"));
    const srcDir = path.join(tempRoot, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(path.join(srcDir, "a.ts"), "export const a = 1;", "utf8");

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

    const projectContext = {
      open: vi.fn(),
    };

    const builder = {
      build: vi.fn().mockReturnValue({
        generatedAt: new Date().toISOString(),
        project: {
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
        },
        nodes: [],
        edges: [],
        cycles: [],
        statistics: {
          totalNodes: 0,
          totalEdges: 0,
          cycles: 0,
        },
      }),
    };

    const formatter = { format: vi.fn().mockReturnValue("# graph") };
    const fileService = {
      ensureDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      find: vi.fn().mockResolvedValue([path.join(srcDir, "a.ts")]),
    };

    const service = new GraphService(scanner as never, projectContext as never, builder as never, formatter as never, fileService as never);
    const result = await service.run();

    expect(fileService.find).toHaveBeenCalledWith(path.join(tempRoot, "src", "**", "*.ts"));
    expect(projectContext.open).not.toHaveBeenCalled();
    expect(result.markdown).toBe("# graph");
  });
});
