import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class ServiceRenderer implements IRenderer {

    readonly name = "Service";
    readonly priority = 50;

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
            `${module.name}.service.ts`,
        );

        fs.mkdirSync(path.dirname(file), { recursive: true });

        fs.writeFileSync(
            file,
`import { Injectable } from "@nestjs/common";
import { ${className}Repository } from "./${module.name}.repository";

@Injectable()
export class ${className}Service {

    constructor(
        private readonly repository: ${className}Repository,
    ) {}

    create(dto:any){
        return this.repository.create(dto);
    }

    findAll(){
        return this.repository.findAll();
    }

    findById(id:string){
        return this.repository.findById(id);
    }

    update(id:string,dto:any){
        return this.repository.update(id,dto);
    }

    delete(id:string){
        return this.repository.delete(id);
    }

}
`,
            "utf8",
        );

        console.log("✔ Service -> " + file);

    }

}
