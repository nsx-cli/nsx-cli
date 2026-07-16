import path from 'path';
import { BaseGenerator } from './base.generator';
import { IGenerator } from '../core/generator/igenerator';
import { ProjectContext } from '../services/project-context.service';

export class ExceptionGenerator extends BaseGenerator implements IGenerator {
  readonly metadata = {
    type: 'exception',
    description: 'Generate exception',
    category: 'error',
    version: '1.0.0',
    aliases: ['ex'],
  };

  private readonly context = ProjectContext.getInstance();

  protected resolveOutputPath(moduleName: string): string {
    return path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      `${moduleName}.exception.ts`,
    );
  }

  protected templateName(): string {
    return 'exception';
  }

  protected async templateData(
    moduleName: string,
  ): Promise<Record<string, unknown>> {
    const projectContext = await this.context;

    return {
      moduleName,
      className: `${this.toPascalCase(moduleName)}Exception`,
      context: projectContext,
    };
  }
}
