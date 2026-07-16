export interface AiRequest {
  prompt: string;
  provider?: string;
  model?: string;
  temperature?: number;
}

export interface AiResponse {
  provider: string;
  model: string;
  content: string;
}

export interface AiProviderRequest {
  prompt: string;
  model: string;
  temperature: number;
}

export interface AiProvider {
  readonly name: string;
  generate(request: AiProviderRequest): Promise<AiResponse>;
}

export interface AiRuntimeConfig {
  provider: string;
  model: string;
  temperature: number;
}
