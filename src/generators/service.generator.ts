import path from 'path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';

export class ServiceGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'service',
    description: 'Generate service',
    category: 'application',
    version: '1.0.0',
    aliases: ['svc'],
  };

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      `${moduleName}.service.ts`,
    );
  }

  protected templateName(): string {
    return 'service';
  }

  protected templateData(moduleName: string): Record<string, unknown> {
    return {
      serviceName: this.toPascalCase(moduleName) + 'Service',
      moduleName,
    };
  }
}
