import { TemplateCache } from "./template-cache.service";
import { TemplateLoader } from "./template-loader.service";
import { TemplateRenderer } from "./template-renderer.service";

export class TemplateService {
  private readonly loader = new TemplateLoader();
  private readonly renderer = new TemplateRenderer();
  private readonly cache = new TemplateCache();

  async render(templateName: string, data: Record<string, unknown>): Promise<string> {
    if (this.cache.has(templateName)) {
      return this.renderer.render(this.cache.get(templateName)!, data);
    }

    const templateContent = await this.loader.load(templateName);
    this.cache.set(templateName, templateContent);

    return this.renderer.render(templateContent, data);
  }
}
