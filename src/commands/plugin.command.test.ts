import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { PluginCommand } from "./plugin.command";

describe("PluginCommand", () => {
  it("exibe listagem de plugins por status", async () => {
    const pluginManager = {
      isInitialized: () => true,
      listLoaded: () => [
        {
          descriptor: { modulePath: "plugin-a" },
          definition: { name: "plugin-a" },
        },
      ],
      listFailed: () => [
        {
          descriptor: { id: "plugin-b" },
          error: "broken",
        },
      ],
      listSkipped: () => [{ id: "plugin-c" }],
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    new PluginCommand(pluginManager as never).register(program);

    await program.parseAsync(["plugins", "list"], { from: "user" });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Plugins carregados: 1"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Plugins com falha: 1"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Plugins ignorados: 1"));

    logSpy.mockRestore();
  });
});