import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class InterceptorGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "interceptor",
    description: "Generate interceptor",
    category: "cross-cutting",
    version: "1.0.0",
    aliases: ["int"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.interceptor.ts`);
  }

  protected templateName(): string {
    return "interceptor";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Interceptor`,
      context: projectContext,
    };
  }
}
