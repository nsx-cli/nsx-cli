import path from 'path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';

export class ModuleGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'module',
    description: 'Generate module',
    category: 'architecture',
    version: '1.0.0',
    aliases: ['mod'],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      `${moduleName}.module.ts`,
    );
  }

  protected templateName(): string {
    return 'module';
  }

  protected templateData(moduleName: string): Record<string, unknown> {
    return {
      moduleName,
      moduleClassName: this.toPascalCase(moduleName) + 'Module',
    };
  }
}
