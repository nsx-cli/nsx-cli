import { describe, expect, it } from 'vitest';
import { OpenAiProvider } from './openai.provider';

describe('OpenAiProvider', () => {
  it('retorna conteúdo da resposta da API', async () => {
    const fetchClient = async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          model: 'gpt-x',
          choices: [
            {
              message: {
                content: 'hello from ai',
              },
            },
          ],
        }),
      }) as Response;

    const provider = new OpenAiProvider(
      'test-key',
      'https://example.com/v1',
      fetchClient,
    );
    const result = await provider.generate({
      prompt: 'hello',
      model: 'gpt-x',
      temperature: 0.2,
    });

    expect(result.provider).toBe('openai');
    expect(result.content).toBe('hello from ai');
  });

  it('falha sem API key', async () => {
    const provider = new OpenAiProvider(
      undefined,
      'https://example.com/v1',
      fetch,
    );

    await expect(
      provider.generate({ prompt: 'hello', model: 'gpt-x', temperature: 0.2 }),
    ).rejects.toThrow('NSX_AI_API_KEY');
  });
});
