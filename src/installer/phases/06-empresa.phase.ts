import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class EmpresaPhase implements InstallerPhase {

    readonly name = "Empresa";

    async execute(): Promise<void> {

        const base = path.join(
            process.cwd(),
            "src",
            "modules",
            "empresa",
        );

        const dirs = [
            "",
            "dto",
            "entities",
            "repositories",
            "services",
            "controllers",
            "interfaces",
            "validators",
            "policies",
            "seed",
        ];

        for (const dir of dirs) {

            fs.mkdirSync(
                path.join(base, dir),
                {
                    recursive: true,
                },
            );

        }

        console.log("Empresa preparado.");

    }

}
