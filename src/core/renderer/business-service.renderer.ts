import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class BusinessServiceRenderer implements IRenderer{

readonly name="BusinessService";
readonly priority=210;

async render(domain:DomainModel):Promise<void>{

const module=domain.modules[0];
if(!module)return;

const className=module.name.charAt(0).toUpperCase()+module.name.slice(1);

const file=path.join(
process.cwd(),
"src",
"modules",
module.name,
`${module.name}.service.ts`
);

fs.writeFileSync(file,`
import { Injectable } from "@nestjs/common";
import { ${className}Repository } from "./${module.name}.repository";
import { Create${className}Dto } from "./dto/create-${module.name}.dto";
import { Update${className}Dto } from "./dto/update-${module.name}.dto";

@Injectable()
export class ${className}Service{

constructor(
private readonly repository:${className}Repository,
){}

create(dto:Create${className}Dto){
return this.repository.create(dto);
}

findAll(){
return this.repository.findAll();
}

findById(id:string){
return this.repository.findById(id);
}

update(id:string,dto:Update${className}Dto){
return this.repository.update(id,dto);
}

delete(id:string){
return this.repository.delete(id);
}

}
`,"utf8");

console.log("✔ Business Service");

}

}
