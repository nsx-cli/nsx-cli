export interface PrismaRelationProps {
  name: string;
  modelName: string;
  fieldName: string;
  type: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  relationName?: string;
  fromFields: readonly string[];
  toFields: readonly string[];
  references: readonly string[];
  onDelete?: string;
  onUpdate?: string;
  documentation?: string;
}

export class PrismaRelation {
  public readonly name: string;
  public readonly modelName: string;
  public readonly fieldName: string;
  public readonly type: string;
  public readonly isList: boolean;
  public readonly isRequired: boolean;
  public readonly isUnique: boolean;
  public readonly relationName: string | undefined;
  public readonly fromFields: readonly string[];
  public readonly toFields: readonly string[];
  public readonly references: readonly string[];
  public readonly onDelete: string | undefined;
  public readonly onUpdate: string | undefined;
  public readonly documentation: string | undefined;

  constructor(props: PrismaRelationProps) {
    this.name = props.name;
    this.modelName = props.modelName;
    this.fieldName = props.fieldName;
    this.type = props.type;
    this.isList = props.isList;
    this.isRequired = props.isRequired;
    this.isUnique = props.isUnique;
    this.relationName = props.relationName;
    this.fromFields = props.fromFields;
    this.toFields = props.toFields;
    this.references = props.references;
    this.onDelete = props.onDelete;
    this.onUpdate = props.onUpdate;
    this.documentation = props.documentation;
  }
}
