import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { CompilerPipeline } from "../../core/compiler";

export class BuildCommand{

    async execute(file:string){

        const pipeline=new CompilerPipeline();

        const result=await pipeline.compile(file);

        const prismaDir=path.resolve(process.cwd(),"generated","prisma");

        await mkdir(prismaDir,{recursive:true});

        await writeFile(

            path.join(prismaDir,"schema.prisma"),

            result.prisma,

            "utf8"

        );

        console.log("");

        console.log("? Blueprint carregado");

        console.log("? Domain gerado");

        console.log("? Prisma compilado");

        console.log("");

        console.log("Arquivo:");

        console.log(path.join(prismaDir,"schema.prisma"));

    }

}
