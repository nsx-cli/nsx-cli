import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class EntityRenderer implements IRenderer {

    readonly name = "Entity";
    readonly priority = 80;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];

        if (!module) return;

        const className =
            module.name.charAt(0).toUpperCase() +
            module.name.slice(1);

        const file = path.join(
            process.cwd(),
            "src",
            "modules",
            module.name,
            `${module.name}.entity.ts`,
        );

        fs.mkdirSync(path.dirname(file), {
            recursive: true,
        });

        const lines: string[] = [];

        lines.push(
'import {',
'Entity,',
'PrimaryGeneratedColumn,',
'Column,',
'CreateDateColumn,',
'UpdateDateColumn',
'} from "typeorm";',
'',
`@Entity("${module.name}s")`,
`export class ${className} {`,
''
);

        for (const field of module.fields) {

            if (field.name === "id") {

                lines.push(
'    @PrimaryGeneratedColumn("uuid")',
'    id!: string;',
''
                );

                continue;
            }

            if (field.name === "createdAt") {

                lines.push(
'    @CreateDateColumn()',
'    createdAt!: Date;',
''
                );

                continue;
            }

            if (field.name === "updatedAt") {

                lines.push(
'    @UpdateDateColumn()',
'    updatedAt!: Date;',
''
                );

                continue;
            }

            const opts: string[] = [];

            if (field.unique) opts.push("unique: true");
            if (!field.required) opts.push("nullable: true");

            let decorator = "@Column()";

            if (opts.length) {
                decorator = `@Column({ ${opts.join(", ")} })`;
            }

            lines.push(
`    ${decorator}`,
`    ${field.name}${field.required ? "!" : "?"}: ${this.tsType(field.type)};`,
""
            );

        }

        lines.push("}");

        fs.writeFileSync(
            file,
            lines.join("\n"),
            "utf8",
        );

        console.log("✔ Entity -> " + file);

    }

    private tsType(type: string): string {

        switch (type) {

            case "boolean":
                return "boolean";

            case "int":
            case "float":
            case "decimal":
                return "number";

            case "date":
            case "datetime":
                return "Date";

            default:
                return "string";

        }

    }

}
