import { readFile } from "fs-extra";
import { TemplateRegistry } from "./template-registry.service";

export class TemplateLoader {
  constructor(private readonly registry: TemplateRegistry = new TemplateRegistry()) {}

  async load(templateName: string): Promise<string> {
    const templatePath = await this.registry.resolveTemplatePath(templateName);
    return readFile(templatePath, "utf8");
  }
}
