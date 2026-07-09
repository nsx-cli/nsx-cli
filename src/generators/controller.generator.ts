import path from "path";
import { FileService } from "../services/file.service";
import { TemplateService } from "../services/template.service";

export class ControllerGenerator {

  private readonly file = new FileService();
  private readonly template = new TemplateService();

  async generate(name: string) {

    const className =
      name.charAt(0).toUpperCase() +
      name.slice(1) +
      "Controller";

    const content = this.template.render("controller", {
      className,
      route: name,
    });

    const folder = path.join(
      process.cwd(),
      "src",
      "modules",
      name
    );

    this.file.ensureDir(folder);

    const file = path.join(
      folder,
      `${name}.controller.ts`
    );

    this.file.write(file, content);

    console.log(`✔ ${file}`);

  }

}