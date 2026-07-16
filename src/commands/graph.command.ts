import { Command } from "commander";
import { GraphFormatter } from "../core/graph/graph-formatter";
import { GraphService } from "../core/graph/graph.service";

export class GraphCommand {
  constructor(
    private readonly graphService: GraphService,
    private readonly formatter: GraphFormatter = new GraphFormatter()
  ) {}

  public register(program: Command): void {
    program
      .command("graph")
      .description("Gera o grafo de dependencias TypeScript do workspace")
      .option("-o, --output <path>", "Caminho do relatorio markdown")
      .action(async (options: { output?: string }) => {
        const result = await this.graphService.run({ outputPath: options.output });

        console.log(this.formatter.formatConsoleSummary(result.report));
        console.log(`Relatorio salvo em ${result.outputPath}`);
      });
  }
}
