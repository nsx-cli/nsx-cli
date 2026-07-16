import { describe, expect, it, vi } from "vitest";

describe("src/index bootstrap coverage", () => {
  it("importa entrypoint e executa bootstrapCli com dependências mockadas", async () => {
    vi.resetModules();

    const register = vi.fn();
    const parseAsync = vi.fn().mockResolvedValue(undefined);
    const initialize = vi.fn().mockResolvedValue(undefined);

    vi.doMock("./cli", () => ({
      createCli: () => ({ parseAsync }),
    }));

    vi.doMock("./bootstrap/bootstrap", () => ({
      Bootstrap: class {
        create() {
          return {
            resolve: (token: unknown) => {
              if (typeof token === "function" && token.name === "PluginManager") {
                return { initialize };
              }

              return { register };
            },
          };
        }
      },
    }));

    vi.doMock("./core/plugin/plugin-manager", () => ({
      PluginManager: class PluginManager {},
    }));

    vi.doMock("./commands/generate.command", () => ({ GenerateCommand: class GenerateCommand {} }));
    vi.doMock("./commands/make.command", () => ({ MakeCommand: class MakeCommand {} }));
    vi.doMock("./commands/doctor.command", () => ({ DoctorCommand: class DoctorCommand {} }));
    vi.doMock("./commands/analyze.command", () => ({ AnalyzeCommand: class AnalyzeCommand {} }));
    vi.doMock("./commands/fix.command", () => ({ FixCommand: class FixCommand {} }));
    vi.doMock("./commands/graph.command", () => ({ GraphCommand: class GraphCommand {} }));
    vi.doMock("./commands/documentation.command", () => ({ DocumentationCommand: class DocumentationCommand {} }));
    vi.doMock("./commands/ai.command", () => ({ AiCommand: class AiCommand {} }));
    vi.doMock("./commands/plugin.command", () => ({ PluginCommand: class PluginCommand {} }));
    vi.doMock("./commands/prisma.command", () => ({ PrismaCommand: class PrismaCommand {} }));

    await import("./index");

    expect(parseAsync).toHaveBeenCalledTimes(1);
  });
});
