import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class ControllerRenderer implements IRenderer {

    readonly name = "Controller";
    readonly priority = 60;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];

        if (!module) return;

        const className =
            module.name.charAt(0).toUpperCase() +
            module.name.slice(1);

        const file = path.join(
            process.cwd(),
            "src",
            "modules",
            module.name,
            `${module.name}.controller.ts`,
        );

        fs.mkdirSync(path.dirname(file), { recursive: true });

        fs.writeFileSync(
            file,
`import {
Controller,
Get,
Post,
Patch,
Delete,
Body,
Param
} from "@nestjs/common";

import { ${className}Service } from "./${module.name}.service";
import { Create${className}Dto } from "./dto/create-${module.name}.dto";
import { Update${className}Dto } from "./dto/update-${module.name}.dto";

@Controller("${module.name}")
export class ${className}Controller {

    constructor(
        private readonly service:${className}Service,
    ){}

    @Post()
    create(@Body() dto:Create${className}Dto){
        return this.service.create(dto);
    }

    @Get()
    findAll(){
        return this.service.findAll();
    }

    @Get(":id")
    findById(@Param("id") id:string){
        return this.service.findById(id);
    }

    @Patch(":id")
    update(
        @Param("id") id:string,
        @Body() dto:Update${className}Dto,
    ){
        return this.service.update(id,dto);
    }

    @Delete(":id")
    delete(@Param("id") id:string){
        return this.service.delete(id);
    }

}
`,
            "utf8",
        );

        console.log("✔ Controller -> " + file);

    }

}
