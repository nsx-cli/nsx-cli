import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { DocumentationCollector } from "./documentation-collector";
import { DocumentationFormatter } from "./documentation-formatter";

describe("Documentation extra coverage", () => {
  it("coleta estrutura e rotas sem prisma", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "nsx-doc-collector-"));
    const srcDir = path.join(tempRoot, "src", "modules", "users");
    await mkdir(srcDir, { recursive: true });

    await writeFile(
      path.join(srcDir, "users.controller.ts"),
      `import { Controller } from "@nestjs/common";

@Controller("users")
export class UsersController {}`
    );
    await writeFile(path.join(srcDir, "users.module.ts"), "export class UsersModule {}");
    await writeFile(path.join(srcDir, "users.service.ts"), "export class UsersService {}");
    await writeFile(path.join(srcDir, "users.repository.ts"), "export class UsersRepository {}");
    await writeFile(path.join(srcDir, "users.entity.ts"), "export class UsersEntity {}");
    await writeFile(path.join(srcDir, "users.dto.ts"), "export class UsersDto {}");

    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: tempRoot,
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: false,
        usesTypeORM: false,
      }),
    };

    const fileService = {
      find: vi.fn().mockResolvedValue([
        path.join(srcDir, "users.controller.ts"),
        path.join(srcDir, "users.module.ts"),
        path.join(srcDir, "users.service.ts"),
        path.join(srcDir, "users.repository.ts"),
        path.join(srcDir, "users.entity.ts"),
        path.join(srcDir, "users.dto.ts"),
      ]),
    };

    const collector = new DocumentationCollector(scanner as never, fileService as never);
    const snapshot = await collector.collect();

    expect(snapshot.structure.modules).toBe(1);
    expect(snapshot.structure.controllers).toBe(1);
    expect(snapshot.routes[0]?.basePath).toBe("users");
    expect(snapshot.prisma.enabled).toBe(false);
  });

  it("cobre erro de prisma no collector e branches do formatter", async () => {
    const scanner = {
      scan: vi.fn().mockResolvedValue({
        rootDir: process.cwd(),
        packageJsonPath: null,
        tsconfigPath: null,
        nestCliPath: null,
        packageJson: null,
        tsconfig: null,
        nestCli: null,
        isNestJs: true,
        usesPrisma: true,
        usesTypeORM: false,
      }),
    };

    const fileService = {
      find: vi.fn().mockResolvedValue([]),
    };

    const prismaLoader = {
      load: vi.fn().mockRejectedValue(new Error("schema missing")),
    };

    const collector = new DocumentationCollector(scanner as never, fileService as never, prismaLoader as never, {} as never);
    const snapshot = await collector.collect();

    expect(snapshot.prisma.enabled).toBe(true);
    expect(snapshot.prisma.errors[0]).toContain("schema missing");

    const formatter = new DocumentationFormatter();
    const markdown = formatter.format(snapshot, "out.md");

    expect(markdown).toContain("No controller routes found");
    expect(markdown).toContain("Errors:");
    expect(formatter.formatConsoleSummary(snapshot)).toContain("Documentation generated");
  });
});
