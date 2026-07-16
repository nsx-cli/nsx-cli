import { describe, expect, it, vi } from "vitest";
import { Logger } from "./logger.service";

describe("Logger", () => {
  it("escreve mensagens de sucesso/info/warn/error", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    Logger.success("ok");
    Logger.info("info");
    Logger.warn("warn");
    Logger.error("error");

    expect(logSpy).toHaveBeenCalledWith("✅ ok");
    expect(logSpy).toHaveBeenCalledWith("ℹ️  info");
    expect(warnSpy).toHaveBeenCalledWith("⚠️  warn");
    expect(errorSpy).toHaveBeenCalledWith("❌ error");

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("faz debug somente em desenvolvimento", () => {
    const original = process.env.NODE_ENV;
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    process.env.NODE_ENV = "test";
    Logger.debug("invisible");

    process.env.NODE_ENV = "development";
    Logger.debug("visible");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("🐛 visible");

    process.env.NODE_ENV = original;
    logSpy.mockRestore();
  });
});
