import { BaseGenerator } from "./base.generator";

export interface GeneratorContext {
  name: string;
  moduleName: string;
  className: string;
  entityName: string;
  moduleClass: string;
  controllerName: string;
  serviceName: string;
  repositoryName: string;
  dtoCreate: string;
  dtoUpdate: string;
  route: string;
  tableName: string;
}

export abstract class CrudGenerator extends BaseGenerator {
  protected createContext(name: string): GeneratorContext {
    const className = this.toPascalCase(name);

    return {
      name,
      moduleName: name,
      className,
      entityName: className,
      moduleClass: `${className}Module`,
      controllerName: `${className}Controller`,
      serviceName: `${className}Service`,
      repositoryName: `${className}Repository`,
      dtoCreate: `Create${className}Dto`,
      dtoUpdate: `Update${className}Dto`,
      route: name.toLowerCase(),
      tableName: name.toLowerCase(),
    };
  }
}
