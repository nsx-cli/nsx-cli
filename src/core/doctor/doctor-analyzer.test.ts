import path from "path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import type { ProjectScannerResult } from "../../services/project-scanner.service";
import { DoctorAnalyzer } from "./doctor-analyzer";

function createProject(): Project {
  const project = new Project({ useInMemoryFileSystem: true });

  project.createSourceFile(
    "src/app.module.ts",
    `import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  providers: [AppService, AppService],
  controllers: [AppController],
})
export class AppModule {}`,
    { overwrite: true }
  );

  project.createSourceFile(
    "src/app.controller.ts",
    `import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("app")
export class AppController {
  constructor(private readonly service: AppService) {}
}`,
    { overwrite: true }
  );

  project.createSourceFile(
    "src/app.service.ts",
    `import { Injectable } from "@nestjs/common";
import { helper } from "./helper";

@Injectable()
export class AppService {
  value = helper();
}`,
    { overwrite: true }
  );

  project.createSourceFile("src/helper.ts", `export const helper = () => "ok";`, { overwrite: true });
  project.createSourceFile(
    "src/cycle-a.ts",
    `import { cycleB } from "./cycle-b";
export const cycleA = () => cycleB();`,
    { overwrite: true }
  );
  project.createSourceFile(
    "src/cycle-b.ts",
    `import { cycleA } from "./cycle-a";
export const cycleB = () => cycleA();`,
    { overwrite: true }
  );

  return project;
}

function createProjectInfo(): ProjectScannerResult {
  const rootDir = "/";

  return {
    rootDir,
    packageJsonPath: path.resolve(process.cwd(), "package.json"),
    tsconfigPath: path.resolve(process.cwd(), "tsconfig.json"),
    nestCliPath: null,
    packageJson: { dependencies: { "@nestjs/common": "^10.0.0", prisma: "^6.0.0" } },
    tsconfig: { compilerOptions: { strict: true } },
    nestCli: null,
    isNestJs: true,
    usesPrisma: true,
    usesTypeORM: false,
  };
}

describe("DoctorAnalyzer", () => {
  it("detecta providers duplicados, imports não utilizados e ciclos", async () => {
    const prismaLoader = {
      load: async () => ({
        path: path.resolve(process.cwd(), "prisma", "schema.prisma"),
        content: "model User { id Int @id }",
      }),
    };

    const analyzer = new DoctorAnalyzer(prismaLoader as never);
    const report = await analyzer.analyze(createProject(), createProjectInfo());

    expect(report.statistics.modules).toBeGreaterThan(0);
    expect(report.statistics.controllers).toBeGreaterThan(0);
    expect(report.statistics.services).toBeGreaterThan(0);
    expect(report.statistics.duplicateProviders).toBe(1);
    expect(report.statistics.circularDependencies).toBeGreaterThan(0);
    expect(report.sections.find((section) => section.name === "Providers duplicados")?.status).toBe("error");
    expect(report.sections.find((section) => section.name === "Imports não utilizados")?.issues.length).toBeGreaterThan(0);
  });

  it("marca alertas quando o projeto não é Nest, Prisma não existe e o tsconfig está ausente", async () => {
    const project = new Project({ useInMemoryFileSystem: true, skipFileDependencyResolution: true });
    project.createSourceFile("/repo/src/plain.ts", "export const plain = 1;", { overwrite: true });

    const analyzer = new DoctorAnalyzer({
      load: async () => {
        throw new Error("schema missing");
      },
    } as never);

    const report = await analyzer.analyze(project, {
      rootDir: "/repo",
      packageJsonPath: null,
      tsconfigPath: null,
      nestCliPath: null,
      packageJson: null,
      tsconfig: null,
      nestCli: null,
      isNestJs: false,
      usesPrisma: false,
      usesTypeORM: false,
    });

    expect(report.sections.find((section) => section.name === "Nest")?.status).toBe("warning");
    expect(report.sections.find((section) => section.name === "Prisma")?.status).toBe("warning");
    expect(report.sections.find((section) => section.name === "TypeScript")?.status).toBe("warning");
  });
});