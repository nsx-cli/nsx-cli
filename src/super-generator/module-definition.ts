export interface ModuleDefinition{

    name:string;

    description?:string;

    entity:boolean;

    repository:boolean;

    service:boolean;

    controller:boolean;

    dto:boolean;

    swagger:boolean;

    prisma:boolean;

    tests:boolean;

}
