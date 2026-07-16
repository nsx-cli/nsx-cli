import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { DoctorCommand } from "./doctor.command";

describe("DoctorCommand", () => {
  it("executa o doctor service e exibe o caminho do relatório", async () => {
    const runMock = vi.fn().mockResolvedValue({
      report: {
        statistics: {
          sourceFiles: 1,
          modules: 1,
          controllers: 1,
          services: 1,
          duplicateProviders: 0,
          unusedImports: 0,
          circularDependencies: 0,
          tsDiagnostics: 0,
        },
        sections: [],
      },
      outputPath: "c:/workspace/.nsx/doctor-report.md",
    });

    const doctorService = {
      run: runMock,
    };

    const command = new DoctorCommand(doctorService as never);
    const program = new Command();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    program.exitOverride();

    command.register(program);

    await program.parseAsync(["doctor", "--output", "c:/workspace/report.md"], { from: "user" });

    expect(runMock).toHaveBeenCalledWith({ outputPath: "c:/workspace/report.md" });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Relatório salvo em"));

    logSpy.mockRestore();
  });
});