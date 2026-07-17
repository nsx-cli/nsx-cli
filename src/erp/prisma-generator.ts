import fs from "node:fs";
import path from "node:path";
import { BlueprintLoader } from "../erp/blueprint-loader";

export class PrismaGenerator {

  private readonly loader = new BlueprintLoader();

  generate(moduleName: string): void {

    const blueprint = this.loader.load(moduleName);

    const lines: string[] = [];

    lines.push(`model ${blueprint.name} {`);

    for (const field of blueprint.fields) {

      let type = this.prismaType(field.type);
      let attrs: string[] = [];

      if (field.primary) {

        if (field.type === "uuid") {
          attrs.push("@id");
          attrs.push("@default(uuid())");
        } else {
          attrs.push("@id");
        }

      } else {

        if (!field.required) {
          type += "?";
        }

        if (field.unique) {
          attrs.push("@unique");
        }

        if (field.default !== undefined) {

          if (typeof field.default === "string") {
            attrs.push(`@default("${field.default}")`);
          } else {
            attrs.push(`@default(${field.default})`);
          }

        }

        if (field.name === "createdAt") {
          attrs = ["@default(now())"];
        }

        if (field.name === "updatedAt") {
          attrs = ["@updatedAt"];
        }

      }

      lines.push(
        `  ${field.name.padEnd(22)} ${type.padEnd(12)} ${attrs.join(" ")}`.trimEnd(),
      );

    }

    lines.push("");
    lines.push(`  @@map("${blueprint.table}")`);
    lines.push("}");

    const output = path.join(
      process.cwd(),
      "src",
      "erp",
      "generated",
    );

    fs.mkdirSync(output, { recursive: true });

    const file = path.join(
      output,
      `${moduleName}.prisma`,
    );

    fs.writeFileSync(
      file,
      lines.join("\n"),
      "utf8",
    );

    console.log(`✅ Prisma gerado: ${file}`);

  }

  private prismaType(type: string): string {

    switch (type) {

      case "uuid":
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

      case "datetime":
      case "date":
        return "DateTime";

      case "json":
        return "Json";

      default:
        return "String";

    }

  }

}
