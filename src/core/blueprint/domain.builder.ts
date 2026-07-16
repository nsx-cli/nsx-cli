import { DomainModel, ModuleModel } from "../domain";

export class DomainBuilder {

    build(data:any):DomainModel{

        const module:ModuleModel={

            name:data.module,

            description:data.description ?? "",

            fields:data.fields ?? [],

            relations:data.relations ?? []

        };

        return{

            name:data.module,

            version:"1.0.0",

            modules:[module]

        };

    }

}
