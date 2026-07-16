import { Command } from 'commander';
import { GeneratorNotFoundException } from '../core/generator/exceptions/generator-not-found.exception';
import { GeneratorRegistry } from '../core/generator/generator.registry';

type MakeTarget = 'api' | 'resource';

export class MakeCommand {
  private readonly targetRegistry = new Map<MakeTarget, string>([
    ['api', 'resource'],
    ['resource', 'resource'],
  ]);

  constructor(private readonly generatorRegistry: GeneratorRegistry) {}

  public register(program: Command): void {
    const make = program
      .command('make')
      .description('Scaffold de recursos de alto nivel');

    this.registerTarget(
      make,
      'api',
      'Gera API completa a partir de um nome de recurso',
    );
    this.registerTarget(
      make,
      'resource',
      'Gera resource completo (module/controller/service/repository/entity/dto)',
    );
  }

  private registerTarget(
    make: Command,
    target: MakeTarget,
    description: string,
  ): void {
    make
      .command(`${target} <name>`)
      .description(description)
      .action(async (name: string) => {
        await this.execute(target, name);
      });
  }

  private async execute(target: MakeTarget, name: string): Promise<void> {
    const generatorType = this.targetRegistry.get(target);

    if (generatorType === undefined) {
      throw new Error(`Target de make não suportado: ${target}`);
    }

    try {
      const generator = this.generatorRegistry.get(generatorType);
      await generator.generate(name);
    } catch (error) {
      if (error instanceof GeneratorNotFoundException) {
        console.log(
          `❌ Generator '${generatorType}' não encontrado para make ${target}.`,
        );
        return;
      }

      throw error;
    }
  }
}
