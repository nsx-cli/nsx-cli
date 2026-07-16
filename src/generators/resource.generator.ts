import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { AddControllerOperation } from "../core/ast/operations/add-controller.operation";
import { AddProviderOperation } from "../core/ast/operations/add-provider.operation";
import { OrganizeImportsOperation } from "../core/ast/operations/organize-imports.operation";
import { ControllerGenerator } from "./controller.generator";
import { DtoGenerator } from "./dto.generator";
import { EntityGenerator } from "./entity.generator";
import { ModuleGenerator } from "./module.generator";
import { RepositoryGenerator } from "./repository.generator";
import { ServiceGenerator } from "./service.generator";
import { AstPersistenceService } from "../core/ast/ast-persistence.service";
import { AstProjectContext } from "../core/ast/ast-project-context";
import { ModuleCrudSupport } from "../core/crud/module-crud-support";

export class ResourceGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "resource",
    description: "Generate full resource",
    category: "scaffold",
    version: "1.0.0",
    aliases: ["res"],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName);
  }

  protected templateName(): string {
    return "resource";
  }

  protected templateData(_moduleName: string): Record<string, unknown> {
    return {};
  }

  public async generate(name: string): Promise<void> {
    const moduleName = this.normalizeName(name);

    this.validate(moduleName);

    const generators = [
      new ModuleGenerator(),
      new ControllerGenerator(),
      new ServiceGenerator(),
      new DtoGenerator(),
      new RepositoryGenerator(),
      new EntityGenerator(),
    ];

    try {
      for (const generator of generators) {
        await generator.generate(moduleName);
      }

      await this.updateModuleMetadata(moduleName);

      this.logSuccess(path.relative(process.cwd(), this.resolveOutputPath(moduleName)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar recurso.";
      this.logError(message);
      throw error;
    }
  }

  private async updateModuleMetadata(moduleName: string): Promise<void> {
    const projectContext = new AstProjectContext();
    const persistenceService = new AstPersistenceService(projectContext);
    const moduleCrudSupport = new ModuleCrudSupport(projectContext, persistenceService);
    const moduleSourceFile = moduleCrudSupport.loadModuleSourceFile(moduleName);
    const classBaseName = this.toPascalCase(moduleName);

    new AddControllerOperation().execute({
      sourceFile: moduleSourceFile,
      controllerName: `${classBaseName}Controller`,
      importPath: `./${moduleName}.controller`,
    });

    new AddProviderOperation().execute({
      sourceFile: moduleSourceFile,
      providerName: `${classBaseName}Service`,
      importPath: `./${moduleName}.service`,
    });

    new OrganizeImportsOperation().execute({ sourceFile: moduleSourceFile });

    await moduleCrudSupport.saveModuleSourceFile(moduleSourceFile);
  }
}
