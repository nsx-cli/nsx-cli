import { describe, expect, it } from "vitest";
import { ApplicationContext } from "./application-context";
import { ServiceNotFoundException } from "./exceptions/service-not-found.exception";

describe("ApplicationContext", () => {
  it("registra, resolve e remove serviços", () => {
    const context = new ApplicationContext();

    context.register("cache", { enabled: true });

    expect(context.has("cache")).toBe(true);
    expect(context.resolve<{ enabled: boolean }>("cache")).toEqual({ enabled: true });

    context.remove("cache");
    expect(context.has("cache")).toBe(false);
  });

  it("lança erro para token duplicado e token ausente", () => {
    const context = new ApplicationContext();

    context.register("config", { a: 1 });

    expect(() => context.register("config", { a: 2 })).toThrow("already registered");
    expect(() => context.resolve("missing")).toThrow(ServiceNotFoundException);

    const symbolToken = Symbol("demo");
    context.register(symbolToken, { a: 1 });

    expect(() => context.register(symbolToken, { a: 2 })).toThrow("Service token already registered: demo");

    class DemoService {}

    context.register(DemoService, new DemoService());

    expect(() => context.register(DemoService, new DemoService())).toThrow("Service token already registered: DemoService");
  });

  it("suporta tokens symbol e classe e limpeza global", () => {
    class DemoService {}

    const token = Symbol("demo");
    const context = new ApplicationContext();

    context.register(token, { ok: true });
    context.register(DemoService, new DemoService());

    expect(context.has(token)).toBe(true);
    expect(context.resolve(token)).toEqual({ ok: true });
    expect(context.resolve(DemoService)).toBeInstanceOf(DemoService);

    context.clear();

    expect(context.has(token)).toBe(false);
    expect(context.has(DemoService)).toBe(false);
  });
});
