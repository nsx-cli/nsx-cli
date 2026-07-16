import { describe, expect, it } from 'vitest';
import {
  GENERATOR_FILE_SUFFIX,
  deriveGeneratorTypeFromFilePath,
  isValidGeneratorType,
  normalizeGeneratorType,
} from './generator-metadata';

describe('generator metadata helpers', () => {
  it('normaliza tipo e valida tipo', () => {
    expect(normalizeGeneratorType('  CRUD  ')).toBe('crud');
    expect(isValidGeneratorType('x')).toBe(true);
    expect(isValidGeneratorType('   ')).toBe(false);
  });

  it('deriva tipo a partir do caminho do arquivo', () => {
    expect(GENERATOR_FILE_SUFFIX).toBe('.generator');
    expect(
      deriveGeneratorTypeFromFilePath('src/generators/user.generator.ts'),
    ).toBe('user');
    expect(
      deriveGeneratorTypeFromFilePath('src\\generators\\dto.GENERATOR.js'),
    ).toBe('dto');
    expect(deriveGeneratorTypeFromFilePath('')).toBe('');
  });
});
