import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class PrismaCrudRenderer implements IRenderer{

readonly name="PrismaCrud";
readonly priority=200;

async render(domain:DomainModel):Promise<void>{

const module=domain.modules[0];
if(!module)return;

const className=module.name.charAt(0).toUpperCase()+module.name.slice(1);

const file=path.join(process.cwd(),"src","modules",module.name,`${module.name}.repository.ts`);

fs.writeFileSync(file,`
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ${className}Repository{

constructor(private readonly prisma:PrismaService){}

create(data:any){
return this.prisma.${module.name}.create({data});
}

findAll(){
return this.prisma.${module.name}.findMany();
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
`,"utf8");

console.log("✔ Prisma CRUD");

}

}
