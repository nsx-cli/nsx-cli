import { describe, expect, it } from "vitest";
import { PluginConfigResolver } from "./plugin-config-resolver";

describe("PluginConfigResolver", () => {
  it("normaliza plugins de config e package.json", async () => {
    const configService = {
      load: async () => ({
        plugins: [
          "@acme/nsx-plugin-a",
          { name: "plugin-b", module: "./plugins/plugin-b.js", enabled: true, options: { mode: "strict" } },
        ],
      }),
    };

    const fileService = {
      exists: async () => true,
      readJson: async () => ({
        nsx: {
          plugins: [
            "@acme/nsx-plugin-c",
            { name: "plugin-d", path: "./plugins/plugin-d.js", enabled: false },
          ],
        },
      }),
    };

    const resolver = new PluginConfigResolver(configService as never, fileService as never, process.cwd());
    const result = await resolver.resolve();

    expect(result).toHaveLength(4);
    expect(result.find((entry) => entry.id === "@acme/nsx-plugin-a")?.enabled).toBe(true);
    expect(result.find((entry) => entry.id === "plugin-b")?.options).toEqual({ mode: "strict" });
    expect(result.find((entry) => entry.id === "plugin-d")?.enabled).toBe(false);
  });
});