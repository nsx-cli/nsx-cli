import { describe, expect, it } from "vitest";
import { Bootstrap } from "./bootstrap";
import { ApplicationContext } from "../core/application/application-context";
import { CrudGenerator } from "../core/crud/crud-generator";
import { GeneratorRegistry } from "../core/generator/generator.registry";
import { PrismaCommand } from "../commands/prisma.command";
import { MakeCommand } from "../commands/make.command";
import { AnalyzeCommand } from "../commands/analyze.command";
import { FixCommand } from "../commands/fix.command";
import { GraphCommand } from "../commands/graph.command";

describe("Bootstrap", () => {
  it("registra os componentes principais no ApplicationContext", () => {
    const context = new Bootstrap().create();
    const generatorRegistry = context.resolve(GeneratorRegistry);

    expect(context).toBeInstanceOf(ApplicationContext);
    expect(context.has(GeneratorRegistry)).toBe(true);
    expect(context.has(CrudGenerator)).toBe(true);
    expect(generatorRegistry.has("test")).toBe(true);
    expect(context.has(PrismaCommand)).toBe(true);
    expect(context.has(MakeCommand)).toBe(true);
    expect(context.has(AnalyzeCommand)).toBe(true);
    expect(context.has(FixCommand)).toBe(true);
    expect(context.has(GraphCommand)).toBe(true);
  });
});
