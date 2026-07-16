import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class MiddlewareGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "middleware",
    description: "Generate middleware",
    category: "http",
    version: "1.0.0",
    aliases: ["mid"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.middleware.ts`);
  }

  protected templateName(): string {
    return "middleware";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Middleware`,
      context: projectContext,
    };
  }
}
