import { Command } from 'commander';
import { AnalyzeFormatter } from '../core/analyze/analyze-formatter';
import { AnalyzeService } from '../core/analyze/analyze.service';

export class AnalyzeCommand {
  constructor(
    private readonly analyzeService: AnalyzeService,
    private readonly formatter: AnalyzeFormatter = new AnalyzeFormatter(),
  ) {}

  public register(program: Command): void {
    program
      .command('analyze')
      .description('Executa análise arquitetural e de qualidade no workspace')
      .option('-o, --output <path>', 'Caminho do relatório markdown')
      .action(async (options: { output?: string }) => {
        const result = await this.analyzeService.run({
          outputPath: options.output,
        });

        console.log(this.formatter.formatConsoleSummary(result.report));
        console.log(`Relatório salvo em ${result.outputPath}`);
      });
  }
}
