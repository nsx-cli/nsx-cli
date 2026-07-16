export interface RelationModel {
  name: string;

  target: string;

  type:
    | "one-to-one"
    | "one-to-many"
    | "many-to-one"
    | "many-to-many";

  cascade?: boolean;

  nullable?: boolean;
}
