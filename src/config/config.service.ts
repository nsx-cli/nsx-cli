import { mkdir, pathExists, readJson, writeJson } from 'fs-extra';
import path from 'path';

export interface NsxConfig {
  workspaceRoot?: string;
  cacheDir?: string;
  [key: string]: unknown;
}

export class ConfigService {
  private readonly defaultCacheDir = path.resolve(
    process.cwd(),
    '.nsx',
    'cache',
  );

  constructor(private readonly rootDir: string = process.cwd()) {}

  async load(): Promise<NsxConfig> {
    const configFromJson = await this.loadJsonConfig();
    const configFromTs = await this.loadTsConfig();

    return {
      workspaceRoot: this.detectWorkspaceRoot(),
      cacheDir: this.defaultCacheDir,
      ...configFromJson,
      ...configFromTs,
    };
  }

  async save(config: NsxConfig): Promise<void> {
    await writeJson(this.getConfigJsonPath(), config, { spaces: 2 });
  }

  async exists(): Promise<boolean> {
    return (
      pathExists(this.getConfigJsonPath()) || pathExists(this.getConfigTsPath())
    );
  }

  async ensureCacheDir(): Promise<string> {
    const cacheDir = path.resolve(this.rootDir, '.nsx', 'cache');
    await this.mkdir(cacheDir);
    return cacheDir;
  }

  private detectWorkspaceRoot(): string {
    return this.rootDir;
  }

  private async loadJsonConfig(): Promise<NsxConfig> {
    const filePath = this.getConfigJsonPath();
    if (!(await pathExists(filePath))) {
      return {};
    }

    return (await readJson(filePath)) as NsxConfig;
  }

  private async loadTsConfig(): Promise<NsxConfig> {
    const filePath = this.getConfigTsPath();
    if (!(await pathExists(filePath))) {
      return {};
    }

    const tsConfig = await this.loadTsModule(filePath);
    return tsConfig && typeof tsConfig === 'object'
      ? (tsConfig as NsxConfig)
      : {};
  }

  private async loadTsModule(filePath: string): Promise<unknown> {
    try {
      const module = await import(filePath);
      return module.default ?? module;
    } catch {
      return {};
    }
  }

  private async mkdir(dirPath: string): Promise<void> {
    await mkdir(dirPath, { recursive: true });
  }

  private getConfigJsonPath(): string {
    return path.resolve(this.rootDir, 'nsx.config.json');
  }

  private getConfigTsPath(): string {
    return path.resolve(this.rootDir, 'nsx.config.ts');
  }
}
