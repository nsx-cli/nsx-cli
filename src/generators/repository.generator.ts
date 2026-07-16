import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class RepositoryGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "repository",
    description: "Generate repository",
    category: "persistence",
    version: "1.0.0",
    aliases: ["repo"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.repository.ts`);
  }

  protected templateName(): string {
    return "repository";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const context = await this.context;

    return {
      repositoryName: `${this.toPascalCase(moduleName)}Repository`,
      context,
    };
  }
}
