import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { ApplicationContext } from "../application/application-context";
import { GeneratorRegistry } from "../generator/generator.registry";
import { PluginLoader } from "./plugin-loader";
import { PluginContext } from "./plugin.types";

describe("PluginLoader", () => {
  it("carrega plugin via factory e executa hooks de lifecycle", async () => {
    const events: string[] = [];

    const importer = async () => ({
      default: (options: Record<string, unknown>) => ({
        name: "test-plugin",
        register: () => {
          events.push(`register:${options.mode}`);
        },
        activate: () => {
          events.push("activate");
        },
      }),
    });

    const loader = new PluginLoader(process.cwd(), importer as never);
    const generatorRegistry = new GeneratorRegistry();
    const context: PluginContext = {
      program: new Command(),
      applicationContext: new ApplicationContext(),
      generatorRegistry,
      rootDir: process.cwd(),
      options: { mode: "strict" },
      registerGenerator: () => undefined,
      registerService: () => undefined,
      resolveService: () => {
        throw new Error("service-not-found");
      },
    };

    const definition = await loader.load(
      {
        id: "test-plugin",
        modulePath: "test-plugin",
        options: { mode: "strict" },
        enabled: true,
        source: "config",
      },
      context
    );

    expect(definition.name).toBe("test-plugin");
    expect(events).toEqual(["register:strict", "activate"]);
  });

  it("resolve caminhos relativos para file URLs", async () => {
    const importer = async () => ({
      default: {
        name: "relative-plugin",
      },
    });

    const loader = new PluginLoader("C:/Projetos/NSX-Vagas-Plus/backend/tools/nsx-cli", importer as never);

    const definition = await loader.load(
      {
        id: "relative-plugin",
        modulePath: "./plugins/relative-plugin.js",
        enabled: true,
        source: "config",
      },
      {
        program: new Command(),
        applicationContext: new ApplicationContext(),
        generatorRegistry: new GeneratorRegistry(),
        rootDir: process.cwd(),
        options: {},
        registerGenerator: () => undefined,
        registerService: () => undefined,
        resolveService: () => {
          throw new Error("not used");
        },
      }
    );

    expect(definition.name).toBe("relative-plugin");
  });
});