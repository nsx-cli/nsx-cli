import { BlueprintLoader } from "./blueprint.loader";
import { DomainBuilder } from "./domain.builder";

export class BlueprintEngine{

    private readonly loader=new BlueprintLoader();

    private readonly builder=new DomainBuilder();

    async compile(file:string){

        const blueprint=await this.loader.load(file);

        return this.builder.build(blueprint);

    }

}
