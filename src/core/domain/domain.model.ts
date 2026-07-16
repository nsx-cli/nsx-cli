import { ModuleModel } from "./module.model";

export interface DomainModel {
  name: string;

  version: string;

  modules: ModuleModel[];
}
