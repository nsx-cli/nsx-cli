import path from "node:path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class RepositoryGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "repository",
    description: "Generate Repository",
    category: "database",
    version: "2.0.0",
    aliases: ["repository", "repo"],
  };

  protected resolveOutputPath(name: string): string {
    return path.join(
      process.cwd(),
      "src",
      "modules",
      name,
      `${name}.repository.ts`,
    );
  }

  protected templateName(): string {
    return "repository";
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
    };
  }
}
