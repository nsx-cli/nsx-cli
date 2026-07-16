import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { GeneratorNotFoundException } from "../core/generator/exceptions/generator-not-found.exception";
import { GenerateCommand } from "./generate.command";

describe("GenerateCommand", () => {
  it("executa o generator quando o tipo existe", async () => {
    const generate = vi.fn().mockResolvedValue(undefined);
    const generatorRegistry = {
      get: vi.fn().mockReturnValue({ generate }),
      list: vi.fn().mockReturnValue([]),
    };

    const program = new Command();
    program.exitOverride();

    new GenerateCommand(generatorRegistry as never).register(program);

    await program.parseAsync(["generate", "resource", "user"], { from: "user" });

    expect(generatorRegistry.get).toHaveBeenCalledWith("resource");
    expect(generate).toHaveBeenCalledWith("user");
  });

  it("lista generators disponíveis quando o tipo não existe", async () => {
    const generatorRegistry = {
      get: vi.fn().mockImplementation(() => {
        throw new GeneratorNotFoundException("x");
      }),
      list: vi.fn().mockReturnValue([
        {
          metadata: { type: "resource", description: "Generate resources" },
        },
      ]),
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    new GenerateCommand(generatorRegistry as never).register(program);

    await program.parseAsync(["generate", "x", "demo"], { from: "user" });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("não encontrado"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("resource - Generate resources"));

    logSpy.mockRestore();
  });
});
