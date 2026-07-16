import { AiProvider } from "./ai.types";

export class AiProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  public register(provider: AiProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  public has(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  public get(name: string): AiProvider {
    const provider = this.providers.get(name.toLowerCase());

    if (!provider) {
      throw new Error(`Provider de AI não encontrado: ${name}`);
    }

    return provider;
  }

  public list(): readonly string[] {
    return Array.from(this.providers.keys()).sort();
  }
}