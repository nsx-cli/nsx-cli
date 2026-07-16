import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";
import { AddProviderOperation } from "./add-provider.operation";

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("test.module.ts", code, { overwrite: true });
}

describe("AddProviderOperation", () => {
  it("adiciona provider em modulo vazio", () => {
    const sourceFile = createSourceFile(
      `
      import { Module } from "@nestjs/common";

      @Module({})
      export class UsersModule {}
      `
    );

    const operation = new AddProviderOperation();
    operation.execute({ sourceFile, providerName: "UsersService", importPath: "./users.service" });

    const output = sourceFile.getFullText();
    expect(output).toContain("providers: [UsersService]");
    expect(output).toContain('import { UsersService } from "./users.service"');
  });

  it("adiciona provider em modulo com providers", () => {
    const sourceFile = createSourceFile(
      `
      import { Module } from "@nestjs/common";

      @Module({
        providers: [ExistingService],
      })
      export class UsersModule {}
      `
    );

    const operation = new AddProviderOperation();
    operation.execute({ sourceFile, providerName: "UsersService", importPath: "./users.service" });

    const output = sourceFile.getFullText();
    expect(output).toContain("providers: [ExistingService, UsersService]");
    expect(output).toContain('import { UsersService } from "./users.service"');
  });

  it("nao adiciona provider duplicado", () => {
    const sourceFile = createSourceFile(
      `
      import { Module } from "@nestjs/common";

      @Module({
        providers: [UsersService],
      })
      export class UsersModule {}
      `
    );

    const operation = new AddProviderOperation();
    operation.execute({ sourceFile, providerName: "UsersService", importPath: "./users.service" });

    const providersText = sourceFile
      .getClasses()[0]
      .getDecorator("Module")
      ?.getCallExpression()
      ?.getArguments()[0]
      .getText();
    const occurrences = providersText?.split("UsersService").length ?? 1;

    expect(providersText).toContain("providers: [UsersService]");
    expect(occurrences - 1).toBe(1);
  });

  it("lanca erro quando modulo nao possui decorator", () => {
    const sourceFile = createSourceFile(
      `
      export class UsersModule {}
      `
    );

    const operation = new AddProviderOperation();

    expect(() => operation.execute({ sourceFile, providerName: "UsersService", importPath: "./users.service" })).toThrow(
      "Module class with @Module decorator was not found"
    );
  });

  it("lanca erro quando metadata do modulo e invalido", () => {
    const sourceFile = createSourceFile(
      `
      import { Module } from "@nestjs/common";

      @Module([])
      export class UsersModule {}
      `
    );

    const operation = new AddProviderOperation();

    expect(() => operation.execute({ sourceFile, providerName: "UsersService", importPath: "./users.service" })).toThrow(
      "@Module metadata object was not found"
    );
  });
});
