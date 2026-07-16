import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class UseCaseGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "usecase",
    description: "Generate use case",
    category: "application",
    version: "1.0.0",
    aliases: ["uc"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.usecase.ts`);
  }

  protected templateName(): string {
    return "usecase";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const context = await this.context;

    return {
      useCaseName: `${this.toPascalCase(moduleName)}UseCase`,
      context,
    };
  }
}
