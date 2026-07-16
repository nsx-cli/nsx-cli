import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { DocumentationCommand } from "./documentation.command";

describe("DocumentationCommand", () => {
  it("executa docs generate com output customizado", async () => {
    const documentationService = {
      generate: vi.fn().mockResolvedValue({
        outputPath: "c:/repo/custom-docs.md",
        snapshot: {
          structure: {
            modules: 1,
            controllers: 1,
            services: 1,
          },
          prisma: {
            models: ["User"],
          },
        },
      }),
    };

    const formatter = {
      formatConsoleSummary: () => "Documentation generated",
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    new DocumentationCommand(documentationService as never, formatter as never).register(program);

    await program.parseAsync(["docs", "generate", "--output", "c:/repo/custom-docs.md"], { from: "user" });

    expect(documentationService.generate).toHaveBeenCalledWith({ outputPath: "c:/repo/custom-docs.md" });
    expect(logSpy).toHaveBeenCalledWith("Documentation generated");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Documentação salva em"));

    logSpy.mockRestore();
  });
});