import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { FixCommand } from "./fix.command";

describe("FixCommand", () => {
  it("executa fix e imprime preview + relatório", async () => {
    const runMock = vi.fn().mockResolvedValue({
      preview: "NSX Fix Preview | Operações planejadas: 2",
      outputPath: "c:/workspace/.nsx/fix-report.md",
      report: {
        summary: {
          totalPlannedOperations: 2,
          executedOperations: 2,
          failedOperations: 0,
          dryRun: false,
        },
        executionPlan: [],
        execution: [],
        analyzeReport: {
          statistics: {
            sourceFiles: 1,
            averageComplexity: 1,
            averageCoupling: 1,
            averageCohesion: 100,
            highComplexityFiles: 0,
          },
        },
      },
    });

    const fixEngine = {
      run: runMock,
    };

    const command = new FixCommand(fixEngine as never);
    const program = new Command();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    program.exitOverride();

    command.register(program);

    await program.parseAsync(["fix", "--dry-run", "--output", "c:/workspace/fix.md"], { from: "user" });

    expect(runMock).toHaveBeenCalledWith({
      dryRun: true,
      outputPath: "c:/workspace/fix.md",
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Relatório salvo em"));

    logSpy.mockRestore();
  });
});
