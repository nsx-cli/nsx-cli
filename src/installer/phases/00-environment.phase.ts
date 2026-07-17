import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class EnvironmentPhase implements InstallerPhase {

    readonly name = "Environment";

    async execute(): Promise<void> {

        const dirs = [
            "src/common",
            "src/core",
            "src/config",
            "src/prisma",
            "src/modules",
            "src/auth",
            "prisma",
            "logs"
        ];

        for (const dir of dirs) {
            fs.mkdirSync(path.join(process.cwd(), dir), {
                recursive: true,
            });
        }

        console.log("Environment preparado.");

    }

}
