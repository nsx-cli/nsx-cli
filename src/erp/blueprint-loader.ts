import fs from "node:fs";
import path from "node:path";

export type BlueprintFieldType =
  | "string"
  | "text"
  | "boolean"
  | "int"
  | "float"
  | "decimal"
  | "uuid"
  | "date"
  | "datetime"
  | "json"
  | "enum"
  | "relation";

export interface BlueprintField {
  name: string;
  type: BlueprintFieldType;
  required?: boolean;
  unique?: boolean;
  primary?: boolean;
  default?: unknown;
  enum?: string[];
  relation?: string;
}

export interface Blueprint {
  name: string;
  table: string;
  fields: BlueprintField[];
}

export class BlueprintLoader {

  constructor(
    private readonly baseDir = path.join(process.cwd(), "src", "erp"),
  ) {}

  load(moduleName: string): Blueprint {

    const file = path.join(
      this.baseDir,
      `${moduleName}.json`,
    );

    if (!fs.existsSync(file)) {
      throw new Error(`Blueprint not found: ${file}`);
    }

    const blueprint = JSON.parse(
      fs.readFileSync(file,"utf8").replace(/^\uFEFF/,""),
    ) as Blueprint;

    this.validate(blueprint);

    return blueprint;
  }

  validate(blueprint: Blueprint): void {

    if (!blueprint.name) {
      throw new Error("Blueprint: name is required.");
    }

    if (!blueprint.table) {
      throw new Error("Blueprint: table is required.");
    }

    if (!Array.isArray(blueprint.fields)) {
      throw new Error("Blueprint: fields must be an array.");
    }

    if (blueprint.fields.length === 0) {
      throw new Error("Blueprint: at least one field is required.");
    }

    const duplicated = new Set<string>();

    for (const field of blueprint.fields) {

      if (!field.name) {
        throw new Error("Blueprint: field without name.");
      }

      if (!field.type) {
        throw new Error(`Blueprint: field ${field.name} without type.`);
      }

      if (duplicated.has(field.name)) {
        throw new Error(`Duplicated field: ${field.name}`);
      }

      duplicated.add(field.name);
    }
  }

  prismaType(field: BlueprintField): string {

    switch (field.type) {

      case "uuid":
        return "String";

      case "string":
      case "text":
        return "String";

      case "boolean":
        return "Boolean";

      case "int":
        return "Int";

      case "float":
      case "decimal":
        return "Float";

      case "date":
      case "datetime":
        return "DateTime";

      case "json":
        return "Json";

      default:
        return "String";
    }
  }

}

