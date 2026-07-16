import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class EntityGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "entity",
    description: "Generate entity",
    category: "domain",
    version: "1.0.0",
    aliases: ["ent"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.entity.ts`);
  }

  protected templateName(): string {
    return "entity";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const context = await this.context;

    return {
      entityName: `${this.toPascalCase(moduleName)}Entity`,
      context,
    };
  }
}
