import { describe, expect, it } from 'vitest';
import { EchoAiProvider } from './echo-ai.provider';

describe('EchoAiProvider', () => {
  it('devolve o prompt com provider e modelo', async () => {
    const provider = new EchoAiProvider();

    const response = await provider.generate({
      prompt: 'hello',
      model: 'echo-model',
      temperature: 0.2,
    });

    expect(response).toEqual({
      provider: 'echo',
      model: 'echo-model',
      content: 'hello',
    });
  });
});
