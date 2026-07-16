import { Command } from 'commander';
import { GeneratorRegistry } from '../core/generator/generator.registry';
import { GeneratorNotFoundException } from '../core/generator/exceptions/generator-not-found.exception';

export class GenerateCommand {
  constructor(private readonly generatorRegistry: GeneratorRegistry) {}

  register(program: Command): void {
    program
      .command('generate <type> <name>')
      .alias('g')
      .description('Generate application resources')
      .action(async (type: string, name: string) => {
        try {
          const generator = this.generatorRegistry.get(type);
          await generator.generate(name);
        } catch (error) {
          if (error instanceof GeneratorNotFoundException) {
            console.log(`❌ Generator '${type}' não encontrado.`);
            console.log('');
            console.log('Generators disponíveis:');

            for (const generator of this.generatorRegistry.list()) {
              console.log(
                `  ${generator.metadata.type} - ${generator.metadata.description}`,
              );
            }

            return;
          }

          throw error;
        }
      });
  }
}
