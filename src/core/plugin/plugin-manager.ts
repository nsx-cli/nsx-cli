import { Command } from "commander";
import { ApplicationContext, ServiceToken } from "../application/application-context";
import { GeneratorRegistry } from "../generator/generator.registry";
import { IGenerator } from "../generator/igenerator";
import { PluginConfigResolver } from "./plugin-config-resolver";
import { PluginLoader } from "./plugin-loader";
import {
  FailedPlugin,
  LoadedPlugin,
  PluginContext,
  PluginDescriptor,
  PluginInitializationResult,
} from "./plugin.types";

export class PluginManager {
  private loaded: LoadedPlugin[] = [];
  private failed: FailedPlugin[] = [];
  private skipped: PluginDescriptor[] = [];
  private initialized = false;

  constructor(
    private readonly configResolver: PluginConfigResolver = new PluginConfigResolver(),
    private readonly loader: PluginLoader = new PluginLoader(),
    private readonly rootDir: string = process.cwd()
  ) {}

  public async initialize(program: Command, applicationContext: ApplicationContext): Promise<PluginInitializationResult> {
    this.loaded = [];
    this.failed = [];
    this.skipped = [];

    const generatorRegistry = applicationContext.resolve(GeneratorRegistry);
    const descriptors = await this.configResolver.resolve();

    for (const descriptor of descriptors) {
      if (!descriptor.enabled) {
        this.skipped.push(descriptor);
        continue;
      }

      const pluginContext = this.createPluginContext(program, applicationContext, generatorRegistry, descriptor);

      try {
        const definition = await this.loader.load(descriptor, pluginContext);
        this.loaded.push({
          descriptor,
          definition,
          loadedAt: new Date().toISOString(),
        });
      } catch (error) {
        this.failed.push({
          descriptor,
          error: error instanceof Error ? error.message : "Erro desconhecido ao carregar plugin.",
          failedAt: new Date().toISOString(),
        });
      }
    }

    this.initialized = true;

    return {
      loaded: [...this.loaded],
      failed: [...this.failed],
      skipped: [...this.skipped],
    };
  }

  public listLoaded(): readonly LoadedPlugin[] {
    return [...this.loaded];
  }

  public listFailed(): readonly FailedPlugin[] {
    return [...this.failed];
  }

  public listSkipped(): readonly PluginDescriptor[] {
    return [...this.skipped];
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private createPluginContext(
    program: Command,
    applicationContext: ApplicationContext,
    generatorRegistry: GeneratorRegistry,
    descriptor: PluginDescriptor
  ): PluginContext {
    return {
      program,
      applicationContext,
      generatorRegistry,
      rootDir: this.rootDir,
      options: descriptor.options ?? {},
      registerGenerator: (generator: IGenerator) => {
        generatorRegistry.register(generator);
      },
      registerService: <T>(token: ServiceToken<T>, value: T) => {
        applicationContext.register(token, value);
      },
      resolveService: <T>(token: ServiceToken<T>) => {
        return applicationContext.resolve(token);
      },
    };
  }
}