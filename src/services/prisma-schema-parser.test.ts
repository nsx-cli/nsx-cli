import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PrismaSchemaParser } from './prisma-schema-parser.service';

function resolveSchemaPath(): string {
  let currentDir = process.cwd();

  while (true) {
    const candidates = [
      path.join(currentDir, 'prisma', 'schema.prisma'),
      path.join(currentDir, 'schema.prisma'),
    ];

    const found = candidates.find((candidate) => fs.existsSync(candidate));
    if (found) {
      return found;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return path.resolve(process.cwd(), 'prisma', 'schema.prisma');
}

describe('PrismaSchemaParser', () => {
  it('extracts models, fields and attributes', () => {
    const parser = new PrismaSchemaParser(resolveSchemaPath());
    const schema = parser.parse();
    const colaborador = parser.findModel('Colaborador');

    expect(colaborador).toBeDefined();
    expect(colaborador?.fields.length).toBeGreaterThan(0);

    const idField = colaborador?.fields.find((field) => field.name === 'id');
    expect(idField).toBeDefined();
    expect(idField?.isId).toBe(true);
    expect(idField?.default).toBe('uuid()');

    const emailField = colaborador?.fields.find(
      (field) => field.name === 'email',
    );
    expect(emailField).toBeDefined();
    expect(emailField?.isOptional).toBe(true);

    const funcoesField = colaborador?.fields.find(
      (field) => field.name === 'funcoes',
    );
    expect(funcoesField).toBeDefined();
    expect(funcoesField?.isArray).toBe(true);

    const enumDefinition = parser.findEnum('ColaboradorStatus');
    expect(enumDefinition).toBeDefined();
    expect(parser.getModels().length).toBeGreaterThan(0);
    expect(schema.enums.length).toBeGreaterThan(0);
  });
});
