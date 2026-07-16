import { pathExists, readJson } from "fs-extra";
import path from "path";
import { MarketplaceManifest } from "../core/marketplace/marketplace.types";

export class TemplateRegistry {
  private readonly templateRoot = path.resolve(process.cwd(), "src", "templates");
  private readonly marketplaceManifestPath = path.resolve(process.cwd(), ".nsx", "template-marketplace.json");

  async resolveTemplatePath(templateName: string): Promise<string> {
    const marketplaceTemplatePath = await this.resolveMarketplaceTemplatePath(templateName);

    if (marketplaceTemplatePath !== undefined) {
      return marketplaceTemplatePath;
    }

    const normalizedTemplateName = this.normalizeTemplateName(templateName);
    const candidates = [
      path.join(this.templateRoot, `${normalizedTemplateName}.hbs`),
      path.join(this.templateRoot, normalizedTemplateName, `${this.templateFileName(normalizedTemplateName)}.hbs`),
      path.join(this.templateRoot, normalizedTemplateName, "index.hbs"),
      path.resolve(__dirname, "..", "templates", `${normalizedTemplateName}.hbs`),
      path.resolve(__dirname, "..", "templates", normalizedTemplateName, `${this.templateFileName(normalizedTemplateName)}.hbs`),
      path.resolve(__dirname, "..", "templates", normalizedTemplateName, "index.hbs"),
    ];

    for (const candidate of candidates) {
      if (await pathExists(candidate)) {
        return candidate;
      }
    }

    throw new Error(`Template '${templateName}' não encontrado. Verifique a pasta de templates ou o nome do template.`);
  }

  private async resolveMarketplaceTemplatePath(templateName: string): Promise<string | undefined> {
    if (!(await pathExists(this.marketplaceManifestPath))) {
      return undefined;
    }

    const manifest = (await readJson(this.marketplaceManifestPath)) as MarketplaceManifest;
    const marketplacePath = manifest.overrides?.[this.normalizeTemplateName(templateName)];

    if (marketplacePath === undefined) {
      return undefined;
    }

    if (await pathExists(marketplacePath)) {
      return marketplacePath;
    }

    return undefined;
  }

  private normalizeTemplateName(templateName: string): string {
    return templateName.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  }

  private templateFileName(templateName: string): string {
    return templateName.split("/").pop() ?? templateName;
  }
}
