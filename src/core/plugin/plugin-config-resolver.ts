import path from "path";
import { ConfigService, NsxConfig } from "../../config/config.service";
import { FileService } from "../../services/file.service";
import { PluginConfigEntry, PluginConfigShape, PluginDescriptor } from "./plugin.types";

interface PackageJsonNsxShape {
  nsx?: PluginConfigShape;
}

export class PluginConfigResolver {
  constructor(
    private readonly configService: ConfigService = new ConfigService(process.cwd()),
    private readonly fileService: FileService = new FileService(),
    private readonly rootDir: string = process.cwd()
  ) {}

  public async resolve(): Promise<PluginDescriptor[]> {
    const fromConfig = await this.resolveFromConfig();
    const fromPackage = await this.resolveFromPackageJson();

    const descriptors = [...fromConfig, ...fromPackage];
    const unique = new Map<string, PluginDescriptor>();

    for (const descriptor of descriptors) {
      if (!unique.has(descriptor.id)) {
        unique.set(descriptor.id, descriptor);
      }
    }

    return Array.from(unique.values());
  }

  private async resolveFromConfig(): Promise<PluginDescriptor[]> {
    const config = await this.configService.load();
    return this.normalizeEntries((config as NsxConfig & PluginConfigShape).plugins, "config");
  }

  private async resolveFromPackageJson(): Promise<PluginDescriptor[]> {
    const packageJsonPath = path.resolve(this.rootDir, "package.json");

    if (!(await this.fileService.exists(packageJsonPath))) {
      return [];
    }

    const packageJson = (await this.fileService.readJson(packageJsonPath)) as PackageJsonNsxShape;
    return this.normalizeEntries(packageJson.nsx?.plugins, "package");
  }

  private normalizeEntries(
    entries: Array<string | PluginConfigEntry> | undefined,
    source: PluginDescriptor["source"]
  ): PluginDescriptor[] {
    if (!entries || entries.length === 0) {
      return [];
    }

    const descriptors: PluginDescriptor[] = [];

    for (const entry of entries) {
      if (typeof entry === "string") {
        descriptors.push({
          id: entry,
          modulePath: entry,
          enabled: true,
          source,
        });
        continue;
      }

      const modulePath = this.resolveModulePath(entry);

      if (!modulePath) {
        continue;
      }

      descriptors.push({
        id: entry.name ?? modulePath,
        modulePath,
        options: entry.options,
        enabled: entry.enabled !== false,
        source,
      });
    }

    return descriptors;
  }

  private resolveModulePath(entry: PluginConfigEntry): string | undefined {
    return entry.module ?? entry.path ?? entry.name;
  }
}