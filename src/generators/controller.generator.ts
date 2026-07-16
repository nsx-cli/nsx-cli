import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class ControllerGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "controller",
    description: "Generate controller",
    category: "http",
    version: "1.0.0",
    aliases: ["ctrl"],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.controller.ts`);
  }

  protected templateName(): string {
    return "controller";
  }

  protected templateData(moduleName: string): Record<string, unknown> {
    return {
      controllerName: this.toPascalCase(moduleName) + "Controller",
      moduleName,
    };
  }
}

