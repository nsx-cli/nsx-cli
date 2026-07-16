import path from "path";
import { BaseGenerator } from "./base.generator";
import { IGenerator } from "../core/generator/igenerator";

export class DtoGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: "dto",
    description: "Generate dto",
    category: "contract",
    version: "1.0.0",
    aliases: [],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, "dto", `create-${moduleName}.dto.ts`);
  }

  protected templateName(): string {
    return "dto/create";
  }

  protected templateData(moduleName: string): Record<string, unknown> {
    return {
      className: this.toPascalCase(moduleName) + "CreateDto",
      propertyName: moduleName,
    };
  }
}
