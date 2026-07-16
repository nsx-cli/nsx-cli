import { describe, expect, it } from "vitest";
import { AnalyzeFormatter } from "./analyze-formatter";
import { AnalyzeReport } from "./analyze.types";

describe("AnalyzeFormatter", () => {
  it("formata markdown e resumo de console", () => {
    const formatter = new AnalyzeFormatter();
    const report: AnalyzeReport = {
      generatedAt: "2026-07-14T00:00:00.000Z",
      project: {
        rootDir: "c:/workspace",
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
      sections: [
        {
          name: "Complexidade",
          status: "info",
          summary: "ok",
          issues: [],
        },
      ],
      statistics: {
        sourceFiles: 10,
        averageComplexity: 3.2,
        averageCoupling: 2.1,
        averageCohesion: 65,
        highComplexityFiles: 0,
      },
    };

    const markdown = formatter.format(report, "c:/workspace/.nsx/analyze-report.md");
    const summary = formatter.formatConsoleSummary(report);

    expect(markdown).toContain("# NSX Analyze Report");
    expect(markdown).toContain("Average complexity");
    expect(summary).toContain("NSX Analyze OK");
  });
});