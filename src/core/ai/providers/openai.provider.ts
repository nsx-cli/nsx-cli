import { AiProvider, AiProviderRequest, AiResponse } from "../ai.types";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class OpenAiProvider implements AiProvider {
  public readonly name = "openai";

  constructor(
    private readonly apiKey: string | undefined = process.env.NSX_AI_API_KEY,
    private readonly baseUrl: string = process.env.NSX_AI_BASE_URL ?? "https://api.openai.com/v1",
    private readonly fetchClient: FetchLike = fetch
  ) {}

  public async generate(request: AiProviderRequest): Promise<AiResponse> {
    if (!this.apiKey) {
      throw new Error("NSX_AI_API_KEY não definido para provider openai.");
    }

    const response = await this.fetchClient(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        temperature: request.temperature,
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request falhou com status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Resposta vazia retornada pelo provider openai.");
    }

    return {
      provider: this.name,
      model: payload.model ?? request.model,
      content,
    };
  }
}