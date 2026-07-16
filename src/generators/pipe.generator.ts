import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class PipeGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "pipe",
    description: "Generate pipe",
    category: "validation",
    version: "1.0.0",
    aliases: ["pp"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.pipe.ts`);
  }

  protected templateName(): string {
    return "pipe";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Pipe`,
      context: projectContext,
    };
  }
}
