import { FieldModel } from "./field.model";
import { RelationModel } from "./relation.model";

export interface ModuleModel {
  name: string;

  description?: string;

  fields: FieldModel[];

  relations: RelationModel[];
}
