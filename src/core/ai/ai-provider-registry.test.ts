import { describe, expect, it } from "vitest";
import { AiProviderRegistry } from "./ai-provider-registry";

describe("AiProviderRegistry", () => {
  it("registra, resolve e lista providers", () => {
    const registry = new AiProviderRegistry();
    const provider = {
      name: "echo",
      generate: async () => ({ provider: "echo", model: "m", content: "ok" }),
    };

    registry.register(provider);

    expect(registry.has("ECHO")).toBe(true);
    expect(registry.get("echo")).toBe(provider);
    expect(registry.list()).toEqual(["echo"]);
    expect(() => registry.get("missing")).toThrow("Provider de AI não encontrado: missing");
  });
});