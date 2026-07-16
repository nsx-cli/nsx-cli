import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { RemoveControllerOperation } from "./remove-controller.operation";
import { RemoveImportOperation } from "./remove-import.operation";
import { RemoveProviderOperation } from "./remove-provider.operation";

describe("Remove operations", () => {
  it("remove import, provider e controller do modulo", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      "test.module.ts",
      `import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";

@Module({
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}`,
      { overwrite: true }
    );

    new RemoveImportOperation().execute({ sourceFile, moduleSpecifier: "./users.service" });
    new RemoveProviderOperation().execute({ sourceFile, providerName: "UsersService" });
    new RemoveControllerOperation().execute({ sourceFile, controllerName: "UsersController" });

    const output = sourceFile.getFullText();
    expect(output).not.toContain('from "./users.service"');
    expect(output).toContain("providers: []");
    expect(output).toContain("controllers: []");
  });
});
