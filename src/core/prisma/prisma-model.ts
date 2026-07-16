import { PrismaEnum } from './prisma-enum';
import { PrismaField } from './prisma-field';
import { PrismaRelation } from './prisma-relation';

export interface PrismaModelProps {
  name: string;
  dbName?: string | null;
  documentation?: string;
  fields: readonly PrismaField[];
  relations: readonly PrismaRelation[];
  enums?: readonly PrismaEnum[];
}

export class PrismaModel {
  public readonly name: string;
  public readonly dbName: string | null | undefined;
  public readonly documentation: string | undefined;
  public readonly fields: readonly PrismaField[];
  public readonly relations: readonly PrismaRelation[];
  public readonly enums: readonly PrismaEnum[];

  constructor(props: PrismaModelProps) {
    this.name = props.name;
    this.dbName = props.dbName;
    this.documentation = props.documentation;
    this.fields = props.fields;
    this.relations = props.relations;
    this.enums = props.enums ?? [];
  }
}
