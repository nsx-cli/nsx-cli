import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class PrismaRepositoryRenderer implements IRenderer {

    readonly name="PrismaRepository";
    readonly priority=95;

    async render(domain:DomainModel):Promise<void>{

        const module=domain.modules[0];
        if(!module)return;

        const className=module.name.charAt(0).toUpperCase()+module.name.slice(1);

        const file=path.join(
            process.cwd(),
            "src",
            "modules",
            module.name,
            `${module.name}.repository.ts`,
        );

        fs.writeFileSync(file,
`import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ${className}Repository{

    constructor(
        private readonly prisma:PrismaService,
    ){}

    create(data:any){
        return this.prisma.${module.name}.create({data});
    }

    findAll(skip=0,take=20){
        return this.prisma.${module.name}.findMany({
            skip,
            take,
        });
    }

    findById(id:string){
        return this.prisma.${module.name}.findUnique({
            where:{id},
        });
    }

    update(id:string,data:any){
        return this.prisma.${module.name}.update({
            where:{id},
            data,
        });
    }

    delete(id:string){
        return this.prisma.${module.name}.delete({
            where:{id},
        });
    }

}
`,
"utf8");

        console.log("✔ Prisma Repository");

    }

}
