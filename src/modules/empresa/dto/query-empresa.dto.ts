import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class QueryEmpresaDto {

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
