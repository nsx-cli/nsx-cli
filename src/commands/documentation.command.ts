import { Command } from 'commander';
import { DocumentationFormatter } from '../core/documentation/documentation-formatter';
import { DocumentationService } from '../core/documentation/documentation.service';

export class DocumentationCommand {
  constructor(
    private readonly documentationService: DocumentationService,
    private readonly formatter: DocumentationFormatter = new DocumentationFormatter(),
  ) {}

  public register(program: Command): void {
    const docs = program
      .command('docs')
      .description('Geração de documentação do projeto');

    docs
      .command('generate')
      .description('Gera documentação em markdown')
      .option('-o, --output <path>', 'Caminho de saída do relatório')
      .action(async (options: { output?: string }) => {
        const result = await this.documentationService.generate({
          outputPath: options.output,
        });

        console.log(this.formatter.formatConsoleSummary(result.snapshot));
        console.log(`Documentação salva em ${result.outputPath}`);
      });
  }
}
