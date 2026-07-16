import path from 'path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';
import { ProjectContext } from '../services/project-context.service';

export class GatewayGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'gateway',
    description: 'Generate gateway',
    category: 'realtime',
    version: '1.0.0',
    aliases: ['gw'],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      `${moduleName}.gateway.ts`,
    );
  }

  protected templateName(): string {
    return 'gateway';
  }

  protected async templateData(
    moduleName: string,
  ): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Gateway`,
      context: projectContext,
    };
  }
}
