import path from "path";
import { GeneratorMetadata } from "../core/generator/generator-metadata";
import { IGenerator } from "../core/generator/igenerator";
import { FileService } from "../services/file.service";
import { TemplateService } from "../services/template.service";

export abstract class BaseGenerator implements IGenerator {
  abstract readonly metadata: GeneratorMetadata;

  protected readonly fileService = new FileService();
  protected readonly templateService = new TemplateService();

  public async generate(name: string): Promise<void> {
    const moduleName = this.normalizeName(name);

    this.validate(moduleName);

    if (this.isDtoGenerator()) {
      await this.generateDto(moduleName);
      return;
    }

    const outputPath = await this.resolveOutputPath(moduleName);

    if (await this.exists(outputPath)) {
      this.logAlreadyExists(path.relative(process.cwd(), outputPath));
      return;
    }

    await this.ensureDirectory(path.dirname(outputPath));

    const content = await this.render(moduleName);
    await this.write(outputPath, content);
    await this.afterGenerate(moduleName, outputPath);

    this.logSuccess(path.relative(process.cwd(), outputPath));
  }

  protected validate(moduleName: string): void {
    if (!moduleName) {
      throw new Error("Nome do módulo é obrigatório.");
    }
  }

  protected abstract resolveOutputPath(moduleName: string): Promise<string> | string;

  protected abstract templateName(): string;

  protected abstract templateData(moduleName: string): Promise<Record<string, unknown>> | Record<string, unknown>;

  protected async render(moduleName: string): Promise<string> {
    return this.templateService.render(this.templateName(), await this.templateData(moduleName));
  }

  private async generateDto(moduleName: string): Promise<void> {
    const createOutputPath = await this.resolveOutputPath(moduleName);
    const updateOutputPath = this.resolveDtoUpdateOutputPath(createOutputPath);

    if (await this.exists(createOutputPath) || await this.exists(updateOutputPath)) {
      this.logAlreadyExists(path.relative(process.cwd(), path.dirname(createOutputPath)));
      return;
    }

    await this.ensureDirectory(path.dirname(createOutputPath));

    const templateData = await this.templateData(moduleName);

    await this.write(createOutputPath, await this.templateService.render(this.templateName(), templateData));
    await this.write(updateOutputPath, await this.templateService.render("dto/update", this.buildDtoUpdateTemplateData(templateData, moduleName)));
    await this.afterGenerate(moduleName, createOutputPath);

    this.logSuccess(path.relative(process.cwd(), path.dirname(createOutputPath)));
  }

  private resolveDtoUpdateOutputPath(createOutputPath: string): string {
    return createOutputPath.replace("create-", "update-");
  }

  private buildDtoUpdateTemplateData(
    templateData: Record<string, unknown>,
    moduleName: string
  ): Record<string, unknown> {
    const className = typeof templateData.className === "string" ? templateData.className : `${this.toPascalCase(moduleName)}CreateDto`;

    return {
      ...templateData,
      className: className.endsWith("CreateDto") ? className.replace("CreateDto", "UpdateDto") : `${this.toPascalCase(moduleName)}UpdateDto`,
    };
  }

  private isDtoGenerator(): boolean {
    return this.metadata.type === "dto";
  }

  protected async write(outputPath: string, content: string): Promise<void> {
    await this.writeFile(outputPath, content);
  }

  protected async afterGenerate(_moduleName: string, _outputPath: string): Promise<void> {
    return Promise.resolve();
  }

  protected normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  protected async renderTemplate(templateName: string, outputPath: string, data: Record<string, unknown>): Promise<void> {
    const content = await this.templateService.render(templateName, data);
    await this.writeFile(outputPath, content);
  }

  protected async ensureDirectory(dirPath: string): Promise<void> {
    await this.fileService.ensureDirectory(dirPath);
  }

  protected async writeFile(filePath: string, content: string): Promise<void> {
    await this.fileService.writeFile(filePath, content);
  }

  protected async exists(filePath: string): Promise<boolean> {
    return this.fileService.exists(filePath);
  }

  protected logSuccess(relativePath: string): void {
    console.log(`✅ ${path.basename(relativePath)} gerado em ${relativePath}`);
  }

  protected logAlreadyExists(relativePath: string): void {
    console.log(`ℹ️  Arquivo já existe: ${relativePath}`);
  }

  protected logError(message: string): void {
    console.error(`❌ ${message}`);
  }

  protected toPascalCase(value: string): string {
    return value
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }
}
