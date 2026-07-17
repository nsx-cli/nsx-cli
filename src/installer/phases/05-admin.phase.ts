import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class AdminPhase implements InstallerPhase {

    readonly name = "Admin";

    async execute(): Promise<void> {

        const modules = [
            "usuario",
            "perfil",
            "permissao",
            "role",
            "configuracao",
            "auditoria"
        ];

        const root = path.join(
            process.cwd(),
            "src",
            "modules",
        );

        for (const module of modules) {

            fs.mkdirSync(
                path.join(root, module),
                { recursive: true },
            );

            fs.mkdirSync(
                path.join(root, module, "dto"),
                { recursive: true },
            );

        }

        console.log("Admin preparado.");

    }

}
