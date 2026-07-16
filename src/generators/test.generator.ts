import path from 'path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';

export class TestGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'test',
    description: 'Generate unit test scaffold',
    category: 'quality',
    version: '1.0.0',
    aliases: ['spec'],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      `${moduleName}.spec.ts`,
    );
  }

  protected templateName(): string {
    return 'test';
  }

  protected templateData(moduleName: string): Record<string, unknown> {
  return {
    name: moduleName,
  };
}
}
