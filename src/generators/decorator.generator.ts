import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class DecoratorGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "decorator",
    description: "Generate decorator",
    category: "cross-cutting",
    version: "1.0.0",
    aliases: ["dec"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.decorator.ts`);
  }

  protected templateName(): string {
    return "decorator";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      functionName: `${this.toPascalCase(moduleName)}Decorator`,
      context: projectContext,
    };
  }
}
