import { Command } from 'commander';
import { describe, expect, it } from 'vitest';
import { ApplicationContext } from '../application/application-context';
import { GeneratorRegistry } from '../generator/generator.registry';
import { PluginManager } from './plugin-manager';

describe('PluginManager', () => {
  it('expõe estados vazios antes da inicialização', () => {
    const manager = new PluginManager();

    expect(manager.isInitialized()).toBe(false);
    expect(manager.listLoaded()).toEqual([]);
    expect(manager.listFailed()).toEqual([]);
    expect(manager.listSkipped()).toEqual([]);
  });

  it('inicializa plugins e segrega carregados/falhos/ignorados', async () => {
    const resolver = {
      resolve: async () => [
        {
          id: 'ok',
          modulePath: 'ok',
          enabled: true,
          source: 'config' as const,
        },
        {
          id: 'fail',
          modulePath: 'fail',
          enabled: true,
          source: 'config' as const,
        },
        {
          id: 'skip',
          modulePath: 'skip',
          enabled: false,
          source: 'config' as const,
        },
      ],
    };

    const loader = {
      load: async (descriptor: { id: string }) => {
        if (descriptor.id === 'fail') {
          throw new Error('broken plugin');
        }

        return { name: descriptor.id };
      },
    };

    const manager = new PluginManager(
      resolver as never,
      loader as never,
      process.cwd(),
    );
    const appContext = new ApplicationContext();
    appContext.register(GeneratorRegistry, new GeneratorRegistry());

    const result = await manager.initialize(new Command(), appContext);

    expect(result.loaded).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.failed[0].error).toContain('broken plugin');
    expect(manager.isInitialized()).toBe(true);
  });
});
