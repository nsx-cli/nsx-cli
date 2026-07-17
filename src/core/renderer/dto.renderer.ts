import fs from "node:fs";
import path from "node:path";

import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class DtoRenderer implements IRenderer {

    readonly name = "DTO";
    readonly priority = 20;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];

        if (!module) {
            return;
        }

        const className =
            module.name.charAt(0).toUpperCase() +
            module.name.slice(1);

        const dtoDir = path.join(
            process.cwd(),
            "src",
            "modules",
            module.name,
            "dto",
        );

        fs.mkdirSync(dtoDir, { recursive: true });

        this.createCreateDto(dtoDir, className, module.fields);
        this.createUpdateDto(dtoDir, className);

        console.log(`✔ DTO -> ${dtoDir}`);

    }

    private createCreateDto(
        dtoDir: string,
        className: string,
        fields: any[],
    ) {

        const lines: string[] = [];

        lines.push(
'import { ApiProperty } from "@nestjs/swagger";',
'import {',
'  IsString,',
'  IsBoolean,',
'  IsInt,',
'  IsNumber,',
'  IsOptional,',
'  IsUUID,',
'  IsDateString,',
'} from "class-validator";',
'',
`export class Create${className}Dto {`,
''
        );

        for (const field of fields) {

            if (
                field.name === "id" ||
                field.name === "createdAt" ||
                field.name === "updatedAt"
            ) {
                continue;
            }

            lines.push(
`  @ApiProperty({ required: ${field.required ? "true" : "false"} })`
            );

            if (!field.required) {
                lines.push("  @IsOptional()");
            }

            lines.push(`  ${this.validator(field.type)}`);

            const optional =
                field.required ? "!" : "?";

            lines.push(
`  ${field.name}${optional}: ${this.tsType(field.type)};`
            );

            lines.push("");

        }

        lines.push("}");

        fs.writeFileSync(
            path.join(
                dtoDir,
                `create-${className.toLowerCase()}.dto.ts`,
            ),
            lines.join("\n"),
            "utf8",
        );

    }

    private createUpdateDto(
        dtoDir: string,
        className: string,
    ) {

        const content = `import { PartialType } from "@nestjs/swagger";
import { Create${className}Dto } from "./create-${className.toLowerCase()}.dto";

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;

        fs.writeFileSync(
            path.join(
                dtoDir,
                `update-${className.toLowerCase()}.dto.ts`,
            ),
            content,
            "utf8",
        );

    }

    private validator(type: string): string {

        switch (type) {

            case "uuid":
                return "@IsUUID()";

            case "boolean":
                return "@IsBoolean()";

            case "int":
                return "@IsInt()";

            case "float":
            case "decimal":
                return "@IsNumber()";

            case "date":
            case "datetime":
                return "@IsDateString()";

            default:
                return "@IsString()";

        }

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
                return "string";

            default:
                return "string";

        }

    }

}
