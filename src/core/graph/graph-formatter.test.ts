import { describe, expect, it } from "vitest";
import { GraphFormatter } from "./graph-formatter";
import type { GraphReport } from "./graph.types";

describe("GraphFormatter", () => {
  it("formata relatório com arestas e ciclos", () => {
    const formatter = new GraphFormatter();
    const report = {
      generatedAt: "2026-07-14T00:00:00.000Z",
      project: {
        rootDir: process.cwd(),
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
      edges: [
        {
          from: `${process.cwd()}/src/a.ts`,
          to: `${process.cwd()}/src/b.ts`,
        },
      ],
      cycles: [{ path: [`${process.cwd()}/src/a.ts`, `${process.cwd()}/src/b.ts`] }],
      statistics: {
        totalNodes: 2,
        totalEdges: 1,
        cycles: 1,
      },
    } satisfies GraphReport;

    const markdown = formatter.format(report, `${process.cwd()}/.nsx/graph.md`);
    const summary = formatter.formatConsoleSummary(report);

    expect(markdown).toContain("```mermaid");
    expect(markdown).toContain("a.ts -> src/b.ts");
    expect(summary).toContain("NSX Graph WARNING");
  });

  it("formata relatório vazio sem ciclos", () => {
    const formatter = new GraphFormatter();
    const report = {
      generatedAt: "2026-07-14T00:00:00.000Z",
      project: {
        rootDir: process.cwd(),
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
    } satisfies GraphReport;

    const markdown = formatter.format(report, `${process.cwd()}/.nsx/graph.md`);

    expect(markdown).toContain("No edges");
    expect(markdown).toContain("No dependency cycles found");
    expect(formatter.formatConsoleSummary(report)).toContain("NSX Graph OK");
  });
});
