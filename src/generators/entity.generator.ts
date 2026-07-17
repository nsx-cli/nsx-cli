import path from "node:path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class EntityGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "entity",
    description: "Generate Entity",
    category: "database",
    version: "2.0.0",
    aliases: ["entity","model"],
  };

  protected resolveOutputPath(name: string): string {
    return path.join(
      process.cwd(),
      "src",
      "modules",
      name,
      `${name}.entity.ts`,
    );
  }

  protected templateName(): string {
    return "entity";
  }

  protected templateData(name: string): Record<string, unknown> {
    const className = this.toPascalCase(name);

    return {
      name,
      moduleName: name,
      className,
      entityName: className,
      repositoryName: `${className}Repository`,
      serviceName: `${className}Service`,
      controllerName: `${className}Controller`,
      dtoCreate: `Create${className}Dto`,
      dtoUpdate: `Update${className}Dto`,
      tableName: name.toLowerCase(),
    };
  }
}
