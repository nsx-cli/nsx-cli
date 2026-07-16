import { Command } from "commander";
import { TemplateMarketplaceService } from "../core/marketplace/template-marketplace.service";

export class MarketplaceCommand {
  constructor(private readonly marketplaceService: TemplateMarketplaceService) {}

  public register(program: Command): void {
    const marketplace = program.command("marketplace").description("Marketplace de templates remotos");
    const templates = marketplace.command("templates").description("Explora e instala templates remotos");

    templates
      .command("list")
      .description("Lista packs remotos disponíveis")
      .option("-c, --catalog-url <url>", "URL do catálogo remoto")
      .action(async (options: { catalogUrl?: string }) => {
        const result = await this.marketplaceService.list(options.catalogUrl);

        console.log(`Templates remotos disponíveis (${result.packs.length}):`);

        for (const pack of result.packs) {
          console.log(`  - ${pack.id} | ${pack.name} | ${pack.version}`);
          console.log(`    ${pack.description}`);
          console.log(`    templates: ${pack.templates.map((template) => template.name).join(", ")}`);
        }
      });

    templates
      .command("search <query>")
      .description("Pesquisa packs remotos por termo")
      .option("-c, --catalog-url <url>", "URL do catálogo remoto")
      .action(async (query: string, options: { catalogUrl?: string }) => {
        const result = await this.marketplaceService.search(query, options.catalogUrl);

        console.log(`Resultados para '${query}' (${result.packs.length}):`);

        if (result.packs.length === 0) {
          console.log("  Nenhum template remoto encontrado.");
          return;
        }

        for (const pack of result.packs) {
          console.log(`  - ${pack.id} | ${pack.name} | ${pack.version}`);
          console.log(`    ${pack.description}`);
        }
      });

    templates
      .command("install <packId>")
      .description("Instala um pack remoto de templates no workspace")
      .option("-c, --catalog-url <url>", "URL do catálogo remoto")
      .action(async (packId: string, options: { catalogUrl?: string }) => {
        const result = await this.marketplaceService.install(packId, { catalogUrl: options.catalogUrl });

        console.log(`Template pack instalado: ${result.pack.name} (${result.pack.id})`);

        for (const template of result.templates) {
          console.log(`  - ${template.name} -> ${template.filePath.replace(/\\/g, "/")}`);
        }

        console.log(`Manifest atualizado em ${result.manifestPath.replace(/\\/g, "/")}`);
      });

    templates
      .command("installed")
      .description("Lista packs de templates instalados localmente")
      .action(async () => {
        const result = await this.marketplaceService.listInstalled();

        console.log(`Templates instalados (${result.packs.length}):`);

        if (result.packs.length === 0) {
          console.log("  Nenhum pack instalado.");
          return;
        }

        for (const pack of result.packs) {
          console.log(`  - ${pack.id} | ${pack.name} | ${pack.version}`);
          console.log(`    instalado em ${pack.installedAt}`);
          console.log(`    templates: ${pack.templates.map((template) => template.name).join(", ")}`);
        }
      });
  }
}