import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class AppModuleRenderer implements IRenderer {

    readonly name="AppModule";
    readonly priority=120;

    async render(domain:DomainModel):Promise<void>{

        const module=domain.modules[0];
        if(!module)return;

        const className=module.name.charAt(0).toUpperCase()+module.name.slice(1);

        const file=path.join(
            process.cwd(),
            "src",
            "app.module.ts",
        );

        fs.writeFileSync(file,`
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ${className}Module } from "./modules/${module.name}/${module.name}.module";

@Module({
    imports:[
        PrismaModule,
        ${className}Module,
    ],
})
export class AppModule{}
`,"utf8");

        console.log("✔ AppModule -> "+file);

    }

}
