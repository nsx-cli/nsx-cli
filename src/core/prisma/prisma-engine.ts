import { PrismaDmmf } from "./prisma-dmmf";
import { PrismaEnum } from "./prisma-enum";
import { PrismaField } from "./prisma-field";
import { PrismaLoader } from "./prisma-loader";
import { PrismaModel } from "./prisma-model";
import { PrismaRelation } from "./prisma-relation";

type PrismaDocument = Awaited<ReturnType<PrismaDmmf["generate"]>>;
type PrismaDocumentModel = PrismaDocument["datamodel"]["models"][number];
type PrismaDocumentField = PrismaDocumentModel["fields"][number];
type PrismaDocumentEnum = PrismaDocument["datamodel"]["enums"][number];

export class PrismaEngine {
  private readonly dmmfGenerator: PrismaDmmf;
  private document: PrismaDocument | undefined;
  private models: readonly PrismaModel[] = [];
  private enums: readonly PrismaEnum[] = [];

  constructor(
    private readonly loader: PrismaLoader,
    dmmfGenerator: PrismaDmmf = new PrismaDmmf()
  ) {
    this.dmmfGenerator = dmmfGenerator;
  }

  public async load(schemaPath?: string): Promise<void> {
    const schemaFile = await this.loader.load({ schemaPath });
    const document = await this.dmmfGenerator.generate(schemaFile.content);

    this.document = document;
    this.models = document.datamodel.models.map((model) => this.toModel(model, document));
    this.enums = document.datamodel.enums.map((entry) => this.toEnum(entry));
  }

  public getModels(): readonly PrismaModel[] {
    return this.models;
  }

  public getModel(name: string): PrismaModel | undefined {
    return this.models.find((model) => model.name === name);
  }

  public getEnums(): readonly PrismaEnum[] {
    return this.enums;
  }

  public getRelations(model: PrismaModel | string): readonly PrismaRelation[] {
    return this.resolveModel(model)?.relations ?? [];
  }

  public getFields(model: PrismaModel | string): readonly PrismaField[] {
    return this.resolveModel(model)?.fields ?? [];
  }

  protected getDmmf(): PrismaDocument | undefined {
    return this.document;
  }

  private resolveModel(model: PrismaModel | string): PrismaModel | undefined {
    return typeof model === "string" ? this.getModel(model) : model;
  }

  private toModel(model: PrismaDocumentModel, document: PrismaDocument): PrismaModel {
    const fields = model.fields.map((field) => this.toField(field));
    const relations = model.fields
      .filter((field) => field.kind === "object")
      .map((field) => this.toRelation(model.name, field));
    const enums = document.datamodel.enums.filter((entry) =>
      model.fields.some((field) => field.kind === "enum" && field.type === entry.name)
    );

    return new PrismaModel({
      name: model.name,
      dbName: model.dbName,
      documentation: model.documentation,
      fields,
      relations,
      enums: enums.map((entry) => this.toEnum(entry)),
    });
  }

  private toField(field: PrismaDocumentField): PrismaField {
    return new PrismaField({
      name: field.name,
      type: field.type,
      kind: field.kind,
      isList: field.isList,
      isRequired: field.isRequired,
      isUnique: field.isUnique,
      isId: field.isId,
      isReadOnly: field.isReadOnly,
      isGenerated: field.isGenerated ?? false,
      hasDefaultValue: field.hasDefaultValue,
      defaultValue: field.default,
      relationName: field.relationName,
      relationFromFields: field.relationFromFields ?? [],
      relationToFields: field.relationToFields ?? [],
      relationOnDelete: field.relationOnDelete,
      relationOnUpdate: field.relationOnUpdate,
      documentation: field.documentation,
    });
  }

  private toRelation(modelName: string, field: PrismaDocumentField): PrismaRelation {
    const relationFromFields = field.relationFromFields ?? [];
    const relationToFields = field.relationToFields ?? [];

    return new PrismaRelation({
      name: field.relationName ?? `${modelName}.${field.name}`,
      modelName,
      fieldName: field.name,
      type: field.type,
      isList: field.isList,
      isRequired: field.isRequired,
      isUnique: field.isUnique,
      relationName: field.relationName,
      fromFields: relationFromFields,
      toFields: relationToFields,
      references: relationToFields,
      onDelete: field.relationOnDelete,
      onUpdate: field.relationOnUpdate,
      documentation: field.documentation,
    });
  }

  private toEnum(enumEntry: PrismaDocumentEnum): PrismaEnum {
    return new PrismaEnum({
      name: enumEntry.name,
      dbName: enumEntry.dbName,
      documentation: enumEntry.documentation,
      values: enumEntry.values.map((value) => ({
        name: value.name,
        documentation: undefined,
      })),
    });
  }
}
