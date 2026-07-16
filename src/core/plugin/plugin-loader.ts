import path from "path";
import { pathToFileURL } from "url";
import { PluginContext, PluginDefinition, PluginDescriptor } from "./plugin.types";

type Importer = (modulePath: string) => Promise<unknown>;

export class PluginLoader {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly importer: Importer = async (modulePath: string) => import(modulePath)
  ) {}

  public async load(descriptor: PluginDescriptor, context: PluginContext): Promise<PluginDefinition> {
    const modulePath = this.resolveImportPath(descriptor.modulePath);
    const moduleRef = await this.importer(modulePath);
    const definition = await this.resolvePluginDefinition(moduleRef, descriptor.options ?? {});

    this.validateDefinition(definition, descriptor.modulePath);

    if (definition.register) {
      await definition.register(context);
    }

    if (definition.activate) {
      await definition.activate(context);
    }

    return definition;
  }

  private resolveImportPath(modulePath: string): string {
    if (modulePath.startsWith(".") || modulePath.startsWith("/") || modulePath.match(/^[A-Za-z]:\\/)) {
      const absolutePath = path.resolve(this.rootDir, modulePath);
      return pathToFileURL(absolutePath).href;
    }

    return modulePath;
  }

  private async resolvePluginDefinition(moduleRef: unknown, options: Record<string, unknown>): Promise<PluginDefinition> {
    const namespace = moduleRef as Record<string, unknown>;
    const candidate = namespace.default ?? namespace.plugin ?? namespace;

    if (typeof candidate === "function") {
      const resolved = await Promise.resolve(candidate(options));
      return resolved as PluginDefinition;
    }

    return candidate as PluginDefinition;
  }

  private validateDefinition(definition: PluginDefinition, modulePath: string): void {
    if (!definition || typeof definition !== "object") {
      throw new Error(`Plugin inválido em ${modulePath}: export esperado é um objeto PluginDefinition.`);
    }

    if (!definition.name || definition.name.trim().length === 0) {
      throw new Error(`Plugin inválido em ${modulePath}: campo 'name' é obrigatório.`);
    }
  }
}