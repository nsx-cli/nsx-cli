import { describe, expect, it } from 'vitest';
import { AiProviderRegistry } from './ai-provider-registry';
import { AiService } from './ai.service';

describe('AiService', () => {
  it('resolve provider e executa prompt', async () => {
    const registry = new AiProviderRegistry();
    registry.register({
      name: 'echo',
      generate: async (request) => ({
        provider: 'echo',
        model: request.model,
        content: `echo:${request.prompt}`,
      }),
    });

    const configService = {
      load: async () => ({
        ai: {
          provider: 'echo',
          model: 'mock-model',
          temperature: 0.4,
        },
      }),
    };

    const service = new AiService(registry, configService as never);
    const response = await service.ask({ prompt: 'hello' });

    expect(response.provider).toBe('echo');
    expect(response.model).toBe('mock-model');
    expect(response.content).toBe('echo:hello');
  });

  it('lista providers registrados', () => {
    const registry = new AiProviderRegistry();
    registry.register({
      name: 'echo',
      generate: async () => ({ provider: 'echo', model: 'm', content: 'ok' }),
    });

    const service = new AiService(registry, {
      load: async () => ({}),
    } as never);

    expect(service.listProviders()).toEqual(['echo']);
  });
});
