import fs from "node:fs";
import path from "node:path";

import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class RepositoryRenderer implements IRenderer {

    readonly name = "Repository";
    readonly priority = 40;

    async render(domain: DomainModel): Promise<void> {

        const module = domain.modules[0];

        if (!module) {
            return;
        }

        const className =
            module.name.charAt(0).toUpperCase() +
            module.name.slice(1);

        const file = path.join(
            process.cwd(),
            "src",
            "modules",
            module.name,
            `${module.name}.repository.ts`,
        );

        fs.mkdirSync(path.dirname(file), {
            recursive: true,
        });

        fs.writeFileSync(
            file,
`import { Injectable } from "@nestjs/common";

@Injectable()
export class ${className}Repository {

    async create(data: any) {
        return data;
    }

    async findAll() {
        return [];
    }

    async findById(id: string) {
        return null;
    }

    async update(id: string, data: any) {
        return data;
    }

    async delete(id: string) {
        return true;
    }

}
`,
            "utf8",
        );

        console.log("✔ Repository -> " + file);

    }

}
