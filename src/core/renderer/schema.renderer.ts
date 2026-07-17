import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class SchemaRenderer implements IRenderer {

    readonly name = "Schema";
    readonly priority = 90;

    async render(domain: DomainModel): Promise<void> {

        const out = path.join(
            process.cwd(),
            "src",
            "erp",
            "generated",
            "schema.prisma",
        );

        fs.mkdirSync(path.dirname(out), { recursive: true });

        const lines:string[] = [];

        lines.push('generator client {');
        lines.push('  provider = "prisma-client-js"');
        lines.push('}');
        lines.push('');
        lines.push('datasource db {');
        lines.push('  provider = "postgresql"');
        lines.push('  url = env("DATABASE_URL")');
        lines.push('}');
        lines.push('');

        for(const module of domain.modules){

            const className =
                module.name.charAt(0).toUpperCase() +
                module.name.slice(1);

            lines.push(`model ${className} {`);

            for(const field of module.fields){

                let type="String";

                switch(field.type){

                    case "boolean":
                        type="Boolean";
                        break;

                    case "int":
                        type="Int";
                        break;

                    case "float":
                    case "decimal":
                        type="Float";
                        break;

                    case "date":
                    case "datetime":
                        type="DateTime";
                        break;

                }

                if(field.name==="id"){
                    lines.push(`  id String @id @default(uuid())`);
                    continue;
                }

                const attrs:string[]=[];

                if(field.unique)
                    attrs.push("@unique");

                if(field.name==="createdAt")
                    attrs.push("@default(now())");

                if(field.name==="updatedAt")
                    attrs.push("@updatedAt");

                const optional =
                    field.required ? "" : "?";

                lines.push(
                    `  ${field.name} ${type}${optional} ${attrs.join(" ")}`
                );

            }

            lines.push("");
            lines.push(`  @@map("${module.name}s")`);
            lines.push("}");
            lines.push("");

        }

        fs.writeFileSync(
            out,
            lines.join("\n"),
            "utf8",
        );

        console.log("✔ Schema -> " + out);

    }

}
