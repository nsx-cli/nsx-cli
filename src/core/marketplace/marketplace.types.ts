export interface MarketplaceTemplateAsset {
  name: string;
  downloadUrl: string;
  description?: string;
}

export interface MarketplaceTemplatePack {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  templates: MarketplaceTemplateAsset[];
}

export interface MarketplaceCatalog {
  generatedAt?: string;
  title?: string;
  packs: MarketplaceTemplatePack[];
}

export interface InstalledMarketplaceTemplate {
  name: string;
  filePath: string;
  sourceUrl: string;
}

export interface InstalledMarketplacePack {
  id: string;
  name: string;
  version: string;
  installedAt: string;
  templates: InstalledMarketplaceTemplate[];
}

export interface MarketplaceManifest {
  installedAt: string;
  catalogUrl: string;
  packs: InstalledMarketplacePack[];
  overrides: Record<string, string>;
}

export interface MarketplaceListResult {
  catalogUrl: string;
  packs: MarketplaceTemplatePack[];
}

export interface MarketplaceSearchResult {
  catalogUrl: string;
  query: string;
  packs: MarketplaceTemplatePack[];
}

export interface MarketplaceInstallResult {
  catalogUrl: string;
  pack: MarketplaceTemplatePack;
  manifestPath: string;
  templates: InstalledMarketplaceTemplate[];
}

export interface MarketplaceInstalledResult {
  manifestPath: string;
  packs: InstalledMarketplacePack[];
}