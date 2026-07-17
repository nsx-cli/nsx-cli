import path from 'node:path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';

export class ControllerGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'controller',
    description: 'Generate NestJS controller',
    category: 'http',
    version: '2.0.0',
    aliases: ['controller', 'ctrl'],
  };

  protected resolveOutputPath(name: string): string {
    return path.join(
      process.cwd(),
      'src',
      'modules',
      name,
      `${name}.controller.ts`,
    );
  }

  protected templateName(): string {
    return 'controller';
  }

  protected templateData(name: string): Record<string, unknown> {
    const className = this.toPascalCase(name);

    return {
      name,
      moduleName: name,
      className,
      controllerName: `${className}Controller`,
      serviceName: `${className}Service`,
      entityName: className,
      route: name.toLowerCase(),
    };
  }
}
