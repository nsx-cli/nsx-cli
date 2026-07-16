import { Command } from "commander";
import { AiService } from "../core/ai/ai.service";

interface AiAskOptions {
  provider?: string;
  model?: string;
  temperature?: string;
}

export class AiCommand {
  constructor(private readonly aiService: AiService) {}

  public register(program: Command): void {
    const ai = program.command("ai").description("AI tools para o CLI");

    ai
      .command("ask <prompt>")
      .description("Executa prompt usando provider de AI configurado")
      .option("-p, --provider <provider>", "Provider (echo, openai)")
      .option("-m, --model <model>", "Modelo de AI")
      .option("-t, --temperature <temperature>", "Temperature entre 0 e 2")
      .action(async (prompt: string, options: AiAskOptions) => {
        const response = await this.aiService.ask({
          prompt,
          provider: options.provider,
          model: options.model,
          temperature: options.temperature !== undefined ? Number(options.temperature) : undefined,
        });

        console.log(response.content);
      });

    ai
      .command("providers")
      .description("Lista providers disponíveis")
      .action(() => {
        const providers = this.aiService.listProviders();

        if (providers.length === 0) {
          console.log("Nenhum provider de AI disponível.");
          return;
        }

        console.log("Providers disponíveis:");

        for (const provider of providers) {
          console.log(`  - ${provider}`);
        }
      });
  }
}