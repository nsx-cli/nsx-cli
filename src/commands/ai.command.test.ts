import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { AiCommand } from "./ai.command";

describe("AiCommand", () => {
  it("executa ai ask", async () => {
    const aiService = {
      ask: vi.fn().mockResolvedValue({
        provider: "echo",
        model: "mock",
        content: "answer",
      }),
      listProviders: vi.fn().mockReturnValue(["echo"]),
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    new AiCommand(aiService as never).register(program);

    await program.parseAsync(["ai", "ask", "hello"], { from: "user" });

    expect(aiService.ask).toHaveBeenCalledWith({
      prompt: "hello",
      provider: undefined,
      model: undefined,
      temperature: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith("answer");

    logSpy.mockRestore();
  });

  it("executa ai providers", async () => {
    const aiService = {
      ask: vi.fn(),
      listProviders: vi.fn().mockReturnValue(["echo", "openai"]),
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    new AiCommand(aiService as never).register(program);

    await program.parseAsync(["ai", "providers"], { from: "user" });

    expect(aiService.listProviders).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("Providers disponíveis:");

    logSpy.mockRestore();
  });
});