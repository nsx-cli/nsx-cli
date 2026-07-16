export interface GeneratorMetadata {
  type: string;
  description: string;
  category: string;
  version: string;
  aliases: string[];
}

export const GENERATOR_FILE_SUFFIX = '.generator';

export function normalizeGeneratorType(value: string): string {
  return value.trim().toLowerCase();
}

export function deriveGeneratorTypeFromFilePath(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const fileName = normalizedPath.split('/').pop() ?? '';

  if (!fileName) {
    return '';
  }

  return normalizeGeneratorType(
    fileName
      .replace(/\.(ts|js)$/i, '')
      .replace(new RegExp(`${GENERATOR_FILE_SUFFIX}$`, 'i'), ''),
  );
}

export function isValidGeneratorType(type: string): boolean {
  return Boolean(type && type.trim().length > 0);
}
