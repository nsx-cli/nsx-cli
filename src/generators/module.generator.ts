import path from "node:path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class ModuleGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "module",
    description: "Generate NestJS Module",
    category: "nest",
    version: "2.0.0",
    aliases: ["module","mod"],
  };

  protected resolveOutputPath(name: string): string {
    return path.join(
      process.cwd(),
      "src",
      "modules",
      name,
      `${name}.module.ts`,
    );
  }

  protected templateName(): string {
    return "module";
  }

  protected templateData(name: string): Record<string, unknown> {
    const className = this.toPascalCase(name);

    return {
      name,
      moduleName: name,
      className,
      entityName: className,
      moduleClass: `${className}Module`,
      controllerName: `${className}Controller`,
      serviceName: `${className}Service`,
      repositoryName: `${className}Repository`,
      dtoCreate: `Create${className}Dto`,
      dtoUpdate: `Update${className}Dto`,
    };
  }
}
