import { DomainModel } from "../../domain";

export class PrismaCompiler {

    compile(domain:DomainModel):string{

        let output="";

        for(const module of domain.modules){

            output+=`model ${this.pascal(module.name)} {

`;

            output+="  id String @id @default(cuid())\n";

            for(const field of module.fields){

                output+=`  ${field.name} ${this.mapType(field.type)}\n`;

            }

            output+="}\n\n";

        }

        return output;

    }

    private mapType(type:string){

        switch(type){

            case "string":

                return "String";

            case "number":

                return "Int";

            case "boolean":

                return "Boolean";

            case "date":

                return "DateTime";

            default:

                return "String";

        }

    }

    private pascal(text:string){

        return text.charAt(0).toUpperCase()+text.slice(1);

    }

}
