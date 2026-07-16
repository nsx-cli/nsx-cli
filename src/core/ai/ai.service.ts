import { ConfigService } from "../../config/config.service";
import { AiProviderRegistry } from "./ai-provider-registry";
import { AiRequest, AiResponse, AiRuntimeConfig } from "./ai.types";

interface AiConfigShape {
  ai?: {
    provider?: string;
    model?: string;
    temperature?: number;
  };
}

export class AiService {
  constructor(
    private readonly registry: AiProviderRegistry,
    private readonly configService: ConfigService = new ConfigService(process.cwd())
  ) {}

  public async ask(request: AiRequest): Promise<AiResponse> {
    const runtime = await this.resolveRuntimeConfig(request);
    const provider = this.registry.get(runtime.provider);

    return provider.generate({
      prompt: request.prompt,
      model: runtime.model,
      temperature: runtime.temperature,
    });
  }

  public listProviders(): readonly string[] {
    return this.registry.list();
  }

  private async resolveRuntimeConfig(request: AiRequest): Promise<AiRuntimeConfig> {
    const loaded = (await this.configService.load()) as AiConfigShape;
    const config = loaded.ai ?? {};

    return {
      provider: request.provider ?? config.provider ?? "echo",
      model: request.model ?? config.model ?? "gpt-4.1-mini",
      temperature: this.normalizeTemperature(request.temperature ?? config.temperature ?? 0.2),
    };
  }

  private normalizeTemperature(value: number): number {
    if (Number.isNaN(value)) {
      return 0.2;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 2) {
      return 2;
    }

    return value;
  }
}