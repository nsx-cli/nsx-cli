import path from "node:path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class ServiceGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "service",
    description: "Generate NestJS service",
    category: "service",
    version: "2.0.0",
    aliases: ["service", "svc"],
  };

  protected resolveOutputPath(name: string): string {
    return path.join(
      process.cwd(),
      "src",
      "modules",
      name,
      `${name}.service.ts`,
    );
  }

  protected templateName(): string {
    return "service";
  }

  protected templateData(name: string): Record<string, unknown> {
    const className = this.toPascalCase(name);

    return {
      name,
      moduleName: name,
      className,
      entityName: className,
      serviceName: `${className}Service`,
      repositoryName: `${className}Repository`,
      controllerName: `${className}Controller`,
      dtoCreate: `Create${className}Dto`,
      dtoUpdate: `Update${className}Dto`,
    };
  }
}
