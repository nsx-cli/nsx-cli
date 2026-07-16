import Handlebars from 'handlebars';

Handlebars.registerHelper('pascalCase', (value: string) => {
  return value
    .split(/[-_\s]+/)
    .map(v => v.charAt(0).toUpperCase() + v.slice(1))
    .join('');
});

Handlebars.registerHelper('camelCase', (value: string) => {
  const text = value
    .split(/[-_\s]+/)
    .map(v => v.charAt(0).toUpperCase() + v.slice(1))
    .join('');

  return text.charAt(0).toLowerCase() + text.slice(1);
});

export class TemplateRenderer {
  render(
    templateContent: string,
    data: Record<string, unknown>,
  ): string {
    const template = Handlebars.compile(templateContent);
    return template(data);
  }
}
