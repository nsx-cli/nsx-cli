import { Project } from "ts-morph";
import { describe, expect, it, vi } from "vitest";
import { AddControllerExecutor } from "./add-controller.executor";
import { AddProviderExecutor } from "./add-provider.executor";
import { OrganizeImportsExecutor } from "./organize-imports.executor";
import { CreateModuleExecutor } from "./create-module.executor";
import { CreateControllerExecutor } from "./create-controller.executor";
import { CreateServiceExecutor } from "./create-service.executor";
import { CreateRepositoryExecutor } from "./create-repository.executor";
import { CreateEntityExecutor } from "./create-entity.executor";
import { CreateCreateDtoExecutor } from "./create-create-dto.executor";
import { CreateUpdateDtoExecutor } from "./create-update-dto.executor";
import { ExecutionStepType } from "../execution-step-type";

describe("Create executors", () => {
  it.each([
    [CreateModuleExecutor, ExecutionStepType.CREATE_MODULE],
    [CreateControllerExecutor, ExecutionStepType.CREATE_CONTROLLER],
    [CreateServiceExecutor, ExecutionStepType.CREATE_SERVICE],
    [CreateRepositoryExecutor, ExecutionStepType.CREATE_REPOSITORY],
    [CreateEntityExecutor, ExecutionStepType.CREATE_ENTITY],
    [CreateCreateDtoExecutor, ExecutionStepType.CREATE_CREATE_DTO],
    [CreateUpdateDtoExecutor, ExecutionStepType.CREATE_UPDATE_DTO],
  ])("delega para o generator correto em %s", async (ExecutorClass, stepType) => {
    const generateMock = vi.fn().mockResolvedValue(undefined);
    const generator = { generate: generateMock };
    const executor = new ExecutorClass(generator as never);

    expect(executor.supports({ type: stepType as ExecutionStepType, target: "user" })).toBe(true);

    await executor.execute({ type: stepType as ExecutionStepType, target: "user" });

    expect(generateMock).toHaveBeenCalledWith("user");
  });
});

describe("AST executors", () => {
  function createSourceFile() {
    const project = new Project({ useInMemoryFileSystem: true });
    return project.createSourceFile(
      "src/modules/user/user.module.ts",
      `import { Module } from "@nestjs/common";

@Module({})
export class UserModule {}`,
      { overwrite: true }
    );
  }

  it("AddProviderExecutor delega para AddProviderOperation e salva o arquivo", async () => {
    const sourceFile = createSourceFile();
    const loadMock = vi.fn().mockReturnValue(sourceFile);
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const support = {
      loadModuleSourceFile: loadMock,
      saveModuleSourceFile: saveMock,
      resolvePascalCase: vi.fn().mockReturnValue("User"),
    };
    const executeMock = vi.fn();
    const operation = { execute: executeMock };

    const executor = new AddProviderExecutor(support as never, operation as never);

    expect(executor.supports({ type: ExecutionStepType.ADD_PROVIDER, target: "user" })).toBe(true);

    await executor.execute({ type: ExecutionStepType.ADD_PROVIDER, target: "user" });

    expect(loadMock).toHaveBeenCalledWith("user");
    expect(executeMock).toHaveBeenCalledWith({
      sourceFile,
      providerName: "UserService",
      importPath: "./user.service",
    });
    expect(saveMock).toHaveBeenCalledWith(sourceFile);
  });

  it("AddControllerExecutor delega para AddControllerOperation e salva o arquivo", async () => {
    const sourceFile = createSourceFile();
    const loadMock = vi.fn().mockReturnValue(sourceFile);
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const support = {
      loadModuleSourceFile: loadMock,
      saveModuleSourceFile: saveMock,
      resolvePascalCase: vi.fn().mockReturnValue("User"),
    };
    const executeMock = vi.fn();
    const operation = { execute: executeMock };

    const executor = new AddControllerExecutor(support as never, operation as never);

    expect(executor.supports({ type: ExecutionStepType.ADD_CONTROLLER, target: "user" })).toBe(true);

    await executor.execute({ type: ExecutionStepType.ADD_CONTROLLER, target: "user" });

    expect(loadMock).toHaveBeenCalledWith("user");
    expect(executeMock).toHaveBeenCalledWith({
      sourceFile,
      controllerName: "UserController",
      importPath: "./user.controller",
    });
    expect(saveMock).toHaveBeenCalledWith(sourceFile);
  });

  it("OrganizeImportsExecutor organiza imports e salva o arquivo", async () => {
    const sourceFile = createSourceFile();
    const loadMock = vi.fn().mockReturnValue(sourceFile);
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const support = {
      loadModuleSourceFile: loadMock,
      saveModuleSourceFile: saveMock,
      resolvePascalCase: vi.fn(),
    };
    const executeMock = vi.fn();
    const operation = { execute: executeMock };

    const executor = new OrganizeImportsExecutor(support as never, operation as never);

    expect(executor.supports({ type: ExecutionStepType.ORGANIZE_IMPORTS, target: "user" })).toBe(true);

    await executor.execute({ type: ExecutionStepType.ORGANIZE_IMPORTS, target: "user" });

    expect(loadMock).toHaveBeenCalledWith("user");
    expect(executeMock).toHaveBeenCalledWith({ sourceFile });
    expect(saveMock).toHaveBeenCalledWith(sourceFile);
  });
});
