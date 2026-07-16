import path from 'path';
import { FileService } from '../../services/file.service';
import {
  InstalledMarketplacePack,
  InstalledMarketplaceTemplate,
  MarketplaceCatalog,
  MarketplaceInstallResult,
  MarketplaceInstalledResult,
  MarketplaceListResult,
  MarketplaceManifest,
  MarketplaceSearchResult,
  MarketplaceTemplatePack,
} from './marketplace.types';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface MarketplaceInstallOptions {
  catalogUrl?: string;
}

export class TemplateMarketplaceService {
  private readonly manifestPath: string;

  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly fileService: FileService = new FileService(),
    private readonly fetchClient: FetchLike = fetch,
    private readonly defaultCatalogUrl: string = process.env
      .NSX_TEMPLATE_MARKETPLACE_URL ??
      'https://raw.githubusercontent.com/nsx-platform/nsx-cli/main/marketplace/catalog.json',
  ) {
    this.manifestPath = path.resolve(
      this.rootDir,
      '.nsx',
      'template-marketplace.json',
    );
  }

  public async list(catalogUrl?: string): Promise<MarketplaceListResult> {
    const resolvedCatalogUrl = this.resolveCatalogUrl(catalogUrl);
    const catalog = await this.fetchCatalog(resolvedCatalogUrl);

    return {
      catalogUrl: resolvedCatalogUrl,
      packs: catalog.packs,
    };
  }

  public async search(
    query: string,
    catalogUrl?: string,
  ): Promise<MarketplaceSearchResult> {
    const normalizedQuery = query.trim().toLowerCase();
    const list = await this.list(catalogUrl);

    const packs = list.packs.filter((pack) => {
      const haystack = [
        pack.id,
        pack.name,
        pack.description,
        pack.version,
        ...pack.tags,
        ...pack.templates.map((template) => template.name),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    return {
      catalogUrl: list.catalogUrl,
      query,
      packs,
    };
  }

  public async install(
    packId: string,
    options: MarketplaceInstallOptions = {},
  ): Promise<MarketplaceInstallResult> {
    const catalogUrl = this.resolveCatalogUrl(options.catalogUrl);
    const catalog = await this.fetchCatalog(catalogUrl);
    const pack = catalog.packs.find((entry) => entry.id === packId);

    if (pack === undefined) {
      throw new Error(`Template pack não encontrado: ${packId}`);
    }

    const templates = await this.installPackTemplates(pack, catalogUrl);
    const manifest = await this.readManifest();
    const updatedManifest = this.mergeManifest(
      manifest,
      catalogUrl,
      pack,
      templates,
    );

    await this.fileService.ensureDirectory(path.dirname(this.manifestPath));
    await this.fileService.writeJson(this.manifestPath, updatedManifest);

    return {
      catalogUrl,
      pack,
      manifestPath: this.manifestPath,
      templates,
    };
  }

  public async listInstalled(): Promise<MarketplaceInstalledResult> {
    const manifest = await this.readManifest();

    return {
      manifestPath: this.manifestPath,
      packs: manifest.packs,
    };
  }

  private async fetchCatalog(catalogUrl: string): Promise<MarketplaceCatalog> {
    const response = await this.fetchClient(catalogUrl);

    if (!response.ok) {
      throw new Error(`Falha ao carregar catálogo remoto: ${response.status}`);
    }

    const catalog = (await response.json()) as MarketplaceCatalog;

    if (!Array.isArray(catalog.packs)) {
      throw new Error("Catálogo remoto inválido: propriedade 'packs' ausente.");
    }

    return catalog;
  }

  private async installPackTemplates(
    pack: MarketplaceTemplatePack,
    catalogUrl: string,
  ): Promise<InstalledMarketplaceTemplate[]> {
    const packRoot = path.resolve(this.rootDir, '.nsx', 'templates', pack.id);
    const templates: InstalledMarketplaceTemplate[] = [];

    for (const template of pack.templates) {
      const content = await this.downloadTemplateContent(
        catalogUrl,
        template.downloadUrl,
      );
      const normalizedName = this.normalizeTemplateName(template.name);
      const filePath = path.resolve(packRoot, `${normalizedName}.hbs`);

      await this.fileService.ensureDirectory(path.dirname(filePath));
      await this.fileService.writeFile(filePath, content);

      templates.push({
        name: normalizedName,
        filePath,
        sourceUrl: this.resolveTemplateUrl(catalogUrl, template.downloadUrl),
      });
    }

    return templates;
  }

  private async downloadTemplateContent(
    catalogUrl: string,
    downloadUrl: string,
  ): Promise<string> {
    const resolvedUrl = this.resolveTemplateUrl(catalogUrl, downloadUrl);
    const response = await this.fetchClient(resolvedUrl);

    if (!response.ok) {
      throw new Error(`Falha ao baixar template remoto: ${resolvedUrl}`);
    }

    return response.text();
  }

  private resolveTemplateUrl(catalogUrl: string, downloadUrl: string): string {
    return new URL(downloadUrl, catalogUrl).toString();
  }

  private resolveCatalogUrl(catalogUrl?: string): string {
    const resolved = catalogUrl ?? this.defaultCatalogUrl;

    if (!resolved || resolved.trim().length === 0) {
      throw new Error('Catálogo de marketplace não configurado.');
    }

    return resolved;
  }

  private async readManifest(): Promise<MarketplaceManifest> {
    if (!(await this.fileService.exists(this.manifestPath))) {
      return {
        installedAt: new Date().toISOString(),
        catalogUrl: this.defaultCatalogUrl,
        packs: [],
        overrides: {},
      };
    }

    return (await this.fileService.readJson(
      this.manifestPath,
    )) as MarketplaceManifest;
  }

  private mergeManifest(
    manifest: MarketplaceManifest,
    catalogUrl: string,
    pack: MarketplaceTemplatePack,
    templates: InstalledMarketplaceTemplate[],
  ): MarketplaceManifest {
    const filteredPacks = manifest.packs.filter(
      (entry) => entry.id !== pack.id,
    );
    const installedPack: InstalledMarketplacePack = {
      id: pack.id,
      name: pack.name,
      version: pack.version,
      installedAt: new Date().toISOString(),
      templates,
    };

    const overrides = { ...manifest.overrides };

    for (const template of templates) {
      overrides[this.normalizeTemplateName(template.name)] = template.filePath;
    }

    return {
      installedAt: new Date().toISOString(),
      catalogUrl,
      packs: [...filteredPacks, installedPack],
      overrides,
    };
  }

  private normalizeTemplateName(templateName: string): string {
    return templateName.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }
}
