import { DomainModel, ModuleModel, FieldModel } from "../domain";

export class DomainBuilder {

    build(data:any):DomainModel{

        const module:ModuleModel={

            name:data.module ?? data.name?.toLowerCase() ?? "module",

            description:data.description ?? "",

            fields:(data.fields ?? []).map((field:any):FieldModel=>({

                name:field.name,

                type:field.type,

                primary:field.primary,

                nullable:field.nullable,

                unique:field.unique,

                required:field.required,

                default:field.default,

                length:field.length,

                relation:field.relation,

                enum:field.enum,

                documentation:field.documentation,

            })),

            relations:data.relations ?? []

        };

        return{

            name:module.name,

            version:"1.0.0",

            modules:[module]

        };

    }

}
