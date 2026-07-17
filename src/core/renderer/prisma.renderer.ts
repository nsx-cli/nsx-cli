import fs from "node:fs";
import path from "node:path";

import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class PrismaRenderer implements IRenderer {

    readonly name = "Prisma";
    readonly priority = 10;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];

        if (!module) {
            return;
        }

        const out = path.join(
            process.cwd(),
            "src",
            "erp",
            "generated",
        );

        fs.mkdirSync(out, { recursive: true });

        const file = path.join(
            out,
            `${module.name}.prisma`,
        );

        const lines: string[] = [];

        lines.push(`model ${this.capitalize(module.name)} {`);
        lines.push("");

        for (const field of module.fields) {

            let type = this.map(field.type);

            const attrs: string[] = [];

            if (!field.required && !field.primary) {
                type += "?";
            }

            if (field.primary) {
                attrs.push("@id");

                if (field.type === "uuid") {
                    attrs.push("@default(uuid())");
                }
            }

            if (field.unique) {
                attrs.push("@unique");
            }

            if (field.name === "createdAt") {
                attrs.push("@default(now())");
            }

            if (field.name === "updatedAt") {
                attrs.push("@updatedAt");
            }

            if (
                field.default !== undefined &&
                field.name !== "createdAt" &&
                field.name !== "updatedAt"
            ) {

                if (typeof field.default === "string") {
                    attrs.push(`@default("${field.default}")`);
                } else {
                    attrs.push(`@default(${field.default})`);
                }

            }

            lines.push(
                `  ${field.name.padEnd(24)} ${type.padEnd(14)} ${attrs.join(" ")}`
            );

        }

        lines.push("");
        lines.push(`  @@map("${module.name}s")`);
        lines.push("}");

        fs.writeFileSync(
            file,
            lines.join("\n"),
            "utf8",
        );

        console.log(`✔ ${file}`);

    }

    private capitalize(value: string): string {

        return value.charAt(0).toUpperCase() + value.slice(1);

    }

    private map(type: string): string {

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
