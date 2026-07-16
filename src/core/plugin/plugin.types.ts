import { Command } from "commander";
import { ApplicationContext, ServiceToken } from "../application/application-context";
import { GeneratorRegistry } from "../generator/generator.registry";
import { IGenerator } from "../generator/igenerator";

export interface PluginDescriptor {
  id: string;
  modulePath: string;
  options?: Record<string, unknown>;
  enabled: boolean;
  source: "config" | "package";
}

export interface PluginConfigShape {
  plugins?: Array<string | PluginConfigEntry>;
}

export interface PluginConfigEntry {
  name?: string;
  module?: string;
  path?: string;
  options?: Record<string, unknown>;
  enabled?: boolean;
}

export interface PluginContext {
  program: Command;
  applicationContext: ApplicationContext;
  generatorRegistry: GeneratorRegistry;
  rootDir: string;
  options: Record<string, unknown>;
  registerGenerator(generator: IGenerator): void;
  registerService<T>(token: ServiceToken<T>, value: T): void;
  resolveService<T>(token: ServiceToken<T>): T;
}

export interface PluginDefinition {
  name: string;
  version?: string;
  description?: string;
  register?(context: PluginContext): Promise<void> | void;
  activate?(context: PluginContext): Promise<void> | void;
  deactivate?(context: PluginContext): Promise<void> | void;
}

export interface LoadedPlugin {
  descriptor: PluginDescriptor;
  definition: PluginDefinition;
  loadedAt: string;
}

export interface FailedPlugin {
  descriptor: PluginDescriptor;
  error: string;
  failedAt: string;
}

export interface PluginInitializationResult {
  loaded: LoadedPlugin[];
  failed: FailedPlugin[];
  skipped: PluginDescriptor[];
}