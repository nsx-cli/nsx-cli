import { ModuleBuilder } from "./builders/module.builder";

export class SuperModuleGenerator{

    private readonly builder=new ModuleBuilder();

    generate(name:string){

        return this.builder.build(name);

    }

}
