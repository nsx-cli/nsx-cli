import { GeneratorRegistry } from "../core/generator/generator.registry";
import { RendererRegistry } from "../core/renderer";
import { BlueprintLoader } from "../erp/blueprint-loader";
import { DomainModel } from "../core/domain";

export class ErpGenerator {

  private readonly loader = new BlueprintLoader();

  constructor(
    private readonly registry: GeneratorRegistry,
    private readonly renderers: RendererRegistry,
  ) {}

  async generate(name: string): Promise<void> {

    const blueprint = this.loader.load(name);

    console.log("");
    console.log("========================================");
    console.log(" NSX ERP GENERATOR");
    console.log("========================================");
    console.log(`Módulo : ${blueprint.name}`);
    console.log(`Tabela : ${blueprint.table}`);
    console.log(`Campos : ${blueprint.fields.length}`);
    console.log("");

    const generators = [
      "module",
      "entity",
      "repository",
      "service",
      "controller",
      "dto",
    ];

    for (const type of generators) {

      if (!this.registry.has(type)) {
        console.warn(`Generator '${type}' não encontrado.`);
        continue;
      }

      await this.registry.get(type).generate(name);

    }

    const domain: DomainModel = {
      name: blueprint.name,
      version: "1.0.0",
      modules: [{
        name: blueprint.name.toLowerCase(),
        description: "",
        relations: [],
        fields: blueprint.fields,
      }],
    };

    await this.renderers.render(domain);

    console.log("");
    console.log("Blueprint:");

    console.table(
      blueprint.fields.map(field => ({
        Campo: field.name,
        Tipo: field.type,
        Obrigatório: field.required ?? false,
        Único: field.unique ?? false,
      })),
    );

    console.log("");
    console.log("ERP gerado com sucesso.");
    console.log("");

  }

}
