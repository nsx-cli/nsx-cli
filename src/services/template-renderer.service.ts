import Handlebars from "handlebars";

export class TemplateRenderer {
  render(templateContent: string, data: Record<string, unknown>): string {
    const template = Handlebars.compile(templateContent);
    return template(data);
  }
}
