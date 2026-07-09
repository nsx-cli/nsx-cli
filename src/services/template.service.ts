import fs from "fs-extra";
import Handlebars from "handlebars";
import path from "path";

export class TemplateService {

  render(template: string, data: Record<string, any>) {

    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      `${template}.hbs`
    );

    const source = fs.readFileSync(templatePath, "utf8");

    return Handlebars.compile(source)(data);

  }

}