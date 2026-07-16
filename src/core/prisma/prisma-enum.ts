export interface PrismaEnumValueProps {
  name: string;
  documentation?: string;
}

export class PrismaEnumValue {
  public readonly name: string;
  public readonly documentation: string | undefined;

  constructor(props: PrismaEnumValueProps) {
    this.name = props.name;
    this.documentation = props.documentation;
  }
}

export interface PrismaEnumProps {
  name: string;
  dbName?: string | null;
  documentation?: string;
  values: readonly PrismaEnumValue[];
}

export class PrismaEnum {
  public readonly name: string;
  public readonly dbName: string | null | undefined;
  public readonly documentation: string | undefined;
  public readonly values: readonly PrismaEnumValue[];

  constructor(props: PrismaEnumProps) {
    this.name = props.name;
    this.dbName = props.dbName;
    this.documentation = props.documentation;
    this.values = props.values;
  }
}
