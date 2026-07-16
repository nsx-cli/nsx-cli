export interface PrismaFieldProps {
  name: string;
  type: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  isGenerated: boolean;
  hasDefaultValue: boolean;
  defaultValue?: unknown;
  relationName?: string;
  relationFromFields: readonly string[];
  relationToFields: readonly string[];
  relationOnDelete?: string;
  relationOnUpdate?: string;
  documentation?: string;
}

export class PrismaField {
  public readonly name: string;
  public readonly type: string;
  public readonly kind: string;
  public readonly isList: boolean;
  public readonly isRequired: boolean;
  public readonly isUnique: boolean;
  public readonly isId: boolean;
  public readonly isReadOnly: boolean;
  public readonly isGenerated: boolean;
  public readonly hasDefaultValue: boolean;
  public readonly defaultValue: unknown;
  public readonly relationName: string | undefined;
  public readonly relationFromFields: readonly string[];
  public readonly relationToFields: readonly string[];
  public readonly relationOnDelete: string | undefined;
  public readonly relationOnUpdate: string | undefined;
  public readonly documentation: string | undefined;

  constructor(props: PrismaFieldProps) {
    this.name = props.name;
    this.type = props.type;
    this.kind = props.kind;
    this.isList = props.isList;
    this.isRequired = props.isRequired;
    this.isUnique = props.isUnique;
    this.isId = props.isId;
    this.isReadOnly = props.isReadOnly;
    this.isGenerated = props.isGenerated;
    this.hasDefaultValue = props.hasDefaultValue;
    this.defaultValue = props.defaultValue;
    this.relationName = props.relationName;
    this.relationFromFields = props.relationFromFields;
    this.relationToFields = props.relationToFields;
    this.relationOnDelete = props.relationOnDelete;
    this.relationOnUpdate = props.relationOnUpdate;
    this.documentation = props.documentation;
  }
}
