import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";
import { AddControllerOperation } from "./add-controller.operation";

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("test.module.ts", code, { overwrite: true });
}

describe("AddControllerOperation", () => {
  it("adiciona controller e import no modulo", () => {
    const sourceFile = createSourceFile(
      `
      import { Module } from "@nestjs/common";

      @Module({})
      export class UsersModule {}
      `
    );

    const operation = new AddControllerOperation();
    operation.execute({ sourceFile, controllerName: "UsersController", importPath: "./users.controller" });

    const output = sourceFile.getFullText();
    expect(output).toContain("controllers: [UsersController]");
    expect(output).toContain('import { UsersController } from "./users.controller"');
  });
});