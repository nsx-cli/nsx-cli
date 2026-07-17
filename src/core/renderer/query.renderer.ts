import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class QueryRenderer implements IRenderer {

    readonly name = "Query";
    readonly priority = 90;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];
        if (!module) return;

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

        fs.mkdirSync(dtoDir,{recursive:true});

        fs.writeFileSync(
            path.join(dtoDir,`query-${module.name}.dto.ts`),
`import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class Query${className}Dto {

    @ApiPropertyOptional({default:1})
    @IsOptional()
    @IsInt()
    @Min(1)
    page=1;

    @ApiPropertyOptional({default:20})
    @IsOptional()
    @IsInt()
    @Min(1)
    limit=20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    orderBy?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    order="asc";

}
`,
"utf8"
        );

        console.log("✔ Query DTO");

    }

}
