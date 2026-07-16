import { Command } from "commander";
import { FixEngine } from "../core/fix/fix-engine";
import { FixReportFormatter } from "../core/fix/fix-report";

interface FixCommandOptions {
  dryRun?: boolean;
  output?: string;
}

export class FixCommand {
  constructor(
    private readonly fixEngine: FixEngine,
    private readonly formatter: FixReportFormatter = new FixReportFormatter()
  ) {}

  public register(program: Command): void {
    program
      .command("fix")
      .description("Analisa e corrige automaticamente problemas estruturais no workspace")
      .option("--dry-run", "Mostra preview sem aplicar alterações")
      .option("-o, --output <path>", "Caminho do relatório markdown")
      .action(async (options: FixCommandOptions) => {
        const result = await this.fixEngine.run({
          dryRun: options.dryRun ?? false,
          outputPath: options.output,
        });

        console.log(result.preview);
        console.log(this.formatter.formatConsoleSummary(result.report));
        console.log(`Relatório salvo em ${result.outputPath}`);
      });
  }
}
