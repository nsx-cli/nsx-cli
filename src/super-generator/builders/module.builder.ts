import { ModuleDefinition } from "../module-definition";

export class ModuleBuilder{

    build(name:string):ModuleDefinition{

        return{

            name,

            entity:true,

            repository:true,

            service:true,

            controller:true,

            dto:true,

            swagger:true,

            prisma:true,

            tests:true

        };

    }

}
