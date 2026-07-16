import { mkdtemp, mkdir, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { Command } from "commander";
import { afterEach, describe, expect, it } from "vitest";
import { PrismaCommand } from "./prisma.command";
import { GeneratorRegistry } from "../core/generator/generator.registry";
import { ModuleGenerator } from "../generators/module.generator";
import { EntityGenerator } from "../generators/entity.generator";
import { RepositoryGenerator } from "../generators/repository.generator";
import { ServiceGenerator } from "../generators/service.generator";
import { ControllerGenerator } from "../generators/controller.generator";
import { DtoGenerator } from "../generators/dto.generator";
import { PrismaLoader } from "../core/prisma/prisma-loader";
import { PrismaDmmf } from "../core/prisma/prisma-dmmf";
import { PrismaEngine } from "../core/prisma/prisma-engine";
import { CrudPlanner } from "../core/crud/crud-planner";
import { AstProjectContext } from "../core/ast/ast-project-context";
import { AstPersistenceService } from "../core/ast/ast-persistence.service";
import { ModuleCrudSupport } from "../core/crud/module-crud-support";
import { CreateModuleExecutor } from "../core/crud/executors/create-module.executor";
import { CreateEntityExecutor } from "../core/crud/executors/create-entity.executor";
import { CreateRepositoryExecutor } from "../core/crud/executors/create-repository.executor";
import { CreateServiceExecutor } from "../core/crud/executors/create-service.executor";
import { CreateControllerExecutor } from "../core/crud/executors/create-controller.executor";
import { CreateCreateDtoExecutor } from "../core/crud/executors/create-create-dto.executor";
import { CreateUpdateDtoExecutor } from "../core/crud/executors/create-update-dto.executor";
import { AddProviderExecutor } from "../core/crud/executors/add-provider.executor";
import { AddControllerExecutor } from "../core/crud/executors/add-controller.executor";
import { OrganizeImportsExecutor } from "../core/crud/executors/organize-imports.executor";
import { AddProviderOperation } from "../core/ast/operations/add-provider.operation";
import { AddControllerOperation } from "../core/ast/operations/add-controller.operation";
import { OrganizeImportsOperation } from "../core/ast/operations/organize-imports.operation";
import { CrudExecutor } from "../core/crud/crud-executor";
import { CrudOrchestratorService } from "../core/crud/crud-orchestrator.service";
import { CrudGenerator } from "../core/crud/crud-generator";

const originalCwd = process.cwd();
const createdRoots: string[] = [];

async function writeTemplate(root: string, templateName: string, content: string): Promise<void> {
  const templatePath = path.resolve(root, "src", "templates", ...templateName.split("/"));
  await mkdir(path.dirname(`${templatePath}.hbs`), { recursive: true });
  await writeFile(`${templatePath}.hbs`, content, "utf8");
}

async function createWorkspaceFixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "nsx-prisma-crud-"));
  createdRoots.push(root);

  await mkdir(path.resolve(root, "prisma"), { recursive: true });
  await mkdir(path.resolve(root, "src", "modules"), { recursive: true });

  await writeFile(
    path.resolve(root, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2021",
          module: "commonjs",
          strict: true,
          esModuleInterop: true,
        },
        include: ["src/**/*.ts"],
      },
      null,
      2
    ),
    "utf8"
  );

  await writeFile(
    path.resolve(root, "prisma", "schema.prisma"),
    `
      datasource db {
        provider = "sqlite"
        url      = "file:./dev.db"
      }

      generator client {
        provider = "prisma-client-js"
      }

      model Usuario {
        id   Int    @id @default(autoincrement())
        nome String
      }
    `,
    "utf8"
  );

  await writeTemplate(
    root,
    "module/module",
    'import { Module } from "@nestjs/common";\n\n@Module({})\nexport class {{moduleClassName}} {}\n'
  );
  await writeTemplate(root, "entity/entity", "export class {{entityName}} {}\n");
  await writeTemplate(root, "repository/repository", "export class {{repositoryName}} {}\n");
  await writeTemplate(root, "service/service", "export class {{serviceName}} {}\n");
  await writeTemplate(root, "controller/controller", "export class {{controllerName}} {}\n");
  await writeTemplate(root, "dto/create", "export class {{className}} {}\n");
  await writeTemplate(root, "dto/update", "export class {{className}} {}\n");

  return root;
}

function createCrudGenerator(): CrudGenerator {
  const generatorRegistry = new GeneratorRegistry();
  generatorRegistry.register(new ModuleGenerator());
  generatorRegistry.register(new EntityGenerator());
  generatorRegistry.register(new RepositoryGenerator());
  generatorRegistry.register(new ServiceGenerator());
  generatorRegistry.register(new ControllerGenerator());
  generatorRegistry.register(new DtoGenerator());

  const prismaLoader = new PrismaLoader();
  const prismaDmmf = new PrismaDmmf();
  const prismaEngine = new PrismaEngine(prismaLoader, prismaDmmf);
  const crudPlanner = new CrudPlanner();

  const astProjectContext = new AstProjectContext();
  const astPersistenceService = new AstPersistenceService(astProjectContext);
  const moduleCrudSupport = new ModuleCrudSupport(astProjectContext, astPersistenceService);

  const executors = [
    new CreateModuleExecutor(generatorRegistry.get("module")),
    new CreateEntityExecutor(generatorRegistry.get("entity")),
    new CreateRepositoryExecutor(generatorRegistry.get("repository")),
    new CreateServiceExecutor(generatorRegistry.get("service")),
    new CreateControllerExecutor(generatorRegistry.get("controller")),
    new CreateCreateDtoExecutor(generatorRegistry.get("dto")),
    new CreateUpdateDtoExecutor(generatorRegistry.get("dto")),
    new AddProviderExecutor(moduleCrudSupport, new AddProviderOperation()),
    new AddControllerExecutor(moduleCrudSupport, new AddControllerOperation()),
    new OrganizeImportsExecutor(moduleCrudSupport, new OrganizeImportsOperation()),
  ];

  const crudExecutor = new CrudExecutor(executors);
  const crudOrchestrator = new CrudOrchestratorService(crudPlanner, crudExecutor);

  return new CrudGenerator(prismaEngine, crudOrchestrator);
}

describe("PrismaCommand integration", () => {
  afterEach(async () => {
    process.chdir(originalCwd);

    while (createdRoots.length > 0) {
      const root = createdRoots.pop();

      if (root !== undefined) {
        await rm(root, { recursive: true, force: true });
      }
    }
  });

  it("executa nsx prisma crud Usuario e gera a estrutura completa", async () => {
    const fixtureRoot = await createWorkspaceFixture();
    process.chdir(fixtureRoot);

    const crudGenerator = createCrudGenerator();
    const prismaCommand = new PrismaCommand(crudGenerator);

    const program = new Command();
    program.exitOverride();
    prismaCommand.register(program);

    await program.parseAsync(["prisma", "crud", "Usuario"], { from: "user" });

    const moduleRoot = path.resolve(fixtureRoot, "src", "modules", "usuario");
    const moduleFile = path.resolve(moduleRoot, "usuario.module.ts");

    const generatedFiles = [
      moduleFile,
      path.resolve(moduleRoot, "usuario.entity.ts"),
      path.resolve(moduleRoot, "usuario.repository.ts"),
      path.resolve(moduleRoot, "usuario.service.ts"),
      path.resolve(moduleRoot, "usuario.controller.ts"),
      path.resolve(moduleRoot, "dto", "create-usuario.dto.ts"),
      path.resolve(moduleRoot, "dto", "update-usuario.dto.ts"),
    ];

    for (const filePath of generatedFiles) {
      const content = await readFile(filePath, "utf8");
      expect(content.length).toBeGreaterThan(0);
    }

    const moduleContent = await readFile(moduleFile, "utf8");
    expect(moduleContent).toContain('import { UsuarioService } from "./usuario.service"');
    expect(moduleContent).toContain('import { UsuarioController } from "./usuario.controller"');
    expect(moduleContent).toContain("providers: [UsuarioService]");
    expect(moduleContent).toContain("controllers: [UsuarioController]");
  }, 60000);
});
