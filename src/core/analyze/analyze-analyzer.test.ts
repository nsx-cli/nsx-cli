import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { AnalyzeAnalyzer } from "./analyze-analyzer";

describe("AnalyzeAnalyzer", () => {
  it("gera seções e estatísticas com warnings e sugestões", async () => {
    const project = new Project({ useInMemoryFileSystem: true, skipFileDependencyResolution: true });

    project.createSourceFile("/repo/src/core/complex.ts", `
import { a } from "./a";
import { b } from "./b";
import { c } from "./c";
import { d } from "./d";
import { e } from "./e";
import { f } from "./f";
import { g } from "./g";
import { h } from "./h";

export class ComplexClass {
  private p1 = 1;
  private p2 = 2;

  run(input: number): number {
    let total = input;
    if (input > 0) total++;
    if (input > 1) total++;
    if (input > 2) total++;
    for (let i = 0; i < 2; i++) total += i;
    for (const item of [1, 2]) total += item;
    while (total < 20) total++;
    do { total++; } while (total < 22);
    switch (input) {
      case 1:
        total += 1;
        break;
      default:
        total += 2;
    }

    try {
      return input > 10 ? total : total + 1;
    } catch {
      return total;
    }
  }
}
`, { overwrite: true });

    project.createSourceFile("/repo/src/commands/cmd.ts", `export class Cmd { execute() { return true; } }`, { overwrite: true });
    project.createSourceFile("/repo/src/generators/gen.ts", `export class Gen { generate() { return true; } }`, { overwrite: true });
    project.createSourceFile("/repo/src/bootstrap/boot.ts", `export class Boot {}`, { overwrite: true });

    const analyzer = new AnalyzeAnalyzer();

    const report = await analyzer.analyze(project, {
      rootDir: "/repo",
      packageJsonPath: null,
      tsconfigPath: null,
      nestCliPath: null,
      packageJson: null,
      tsconfig: null,
      nestCli: null,
      isNestJs: true,
      usesPrisma: false,
      usesTypeORM: false,
    });

    expect(report.statistics.sourceFiles).toBe(4);
    expect(report.sections.find((section) => section.name === "Complexidade")?.status).toBe("warning");
    expect(report.sections.find((section) => section.name === "Acoplamento")?.status).toBe("warning");
    expect(report.sections.find((section) => section.name === "Arquitetura")?.status).toBe("info");
    expect(report.sections.find((section) => section.name === "Sugestões")?.issues.length).toBeGreaterThan(0);
  });

  it("marca erro quando camada arquitetural obrigatória não existe", async () => {
    const project = new Project({ useInMemoryFileSystem: true, skipFileDependencyResolution: true });
    project.createSourceFile("/repo/src/only.ts", "export const x = 1;", { overwrite: true });

    const analyzer = new AnalyzeAnalyzer();

    const report = await analyzer.analyze(project, {
      rootDir: "/repo",
      packageJsonPath: null,
      tsconfigPath: null,
      nestCliPath: null,
      packageJson: null,
      tsconfig: null,
      nestCli: null,
      isNestJs: true,
      usesPrisma: false,
      usesTypeORM: false,
    });

    const architecture = report.sections.find((section) => section.name === "Arquitetura");

    expect(architecture?.status).toBe("error");
    expect(architecture?.issues.length).toBeGreaterThan(0);
  });
});
