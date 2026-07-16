import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";
import { ProjectContext } from "../services/project-context.service";

export class GuardGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "guard",
    description: "Generate guard",
    category: "security",
    version: "1.0.0",
    aliases: ["grd"],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.guard.ts`);
  }

  protected templateName(): string {
    return "guard";
  }

  protected async templateData(moduleName: string): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Guard`,
      context: projectContext,
    };
  }
}
