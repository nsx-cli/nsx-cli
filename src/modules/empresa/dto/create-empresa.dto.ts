import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
} from "class-validator";

export class CreateEmpresaDto {

  @ApiProperty({ required: true })
  @IsString()
  razaoSocial!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cep?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logradouro?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

}