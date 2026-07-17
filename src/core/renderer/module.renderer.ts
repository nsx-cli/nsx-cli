import fs from "node:fs";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class ModuleRenderer implements IRenderer {

    readonly name = "Module";
    readonly priority = 70;

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
            `${module.name}.module.ts`,
        );

        fs.mkdirSync(path.dirname(file), { recursive: true });

        fs.writeFileSync(
            file,
`import { Module } from "@nestjs/common";

import { ${className}Controller } from "./${module.name}.controller";
import { ${className}Service } from "./${module.name}.service";
import { ${className}Repository } from "./${module.name}.repository";

@Module({
    controllers: [
        ${className}Controller,
    ],
    providers: [
        ${className}Service,
        ${className}Repository,
    ],
    exports: [
        ${className}Service,
    ],
})
export class ${className}Module {}
`,
            "utf8",
        );

        console.log("✔ Module -> " + file);

    }

}
