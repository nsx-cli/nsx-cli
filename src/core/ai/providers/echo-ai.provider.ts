import { AiProvider, AiProviderRequest, AiResponse } from '../ai.types';

export class EchoAiProvider implements AiProvider {
  public readonly name = 'echo';

  public async generate(request: AiProviderRequest): Promise<AiResponse> {
    return {
      provider: this.name,
      model: request.model,
      content: request.prompt,
    };
  }
}
