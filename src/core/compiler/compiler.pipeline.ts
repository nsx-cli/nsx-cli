import { BlueprintEngine } from "../blueprint";
import { PrismaCompiler } from "../schema/compiler/prisma.compiler";

export class CompilerPipeline {

    private readonly blueprint = new BlueprintEngine();

    private readonly prisma = new PrismaCompiler();

    async compile(file:string){

        const domain = await this.blueprint.compile(file);

        return{

            domain,

            prisma:this.prisma.compile(domain)

        };

    }

}
