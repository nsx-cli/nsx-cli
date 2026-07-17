import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class AuthPhase implements InstallerPhase {

    readonly name = "Auth";

    async execute(): Promise<void> {

        const dirs = [
            "src/auth",
            "src/auth/dto",
            "src/auth/guards",
            "src/auth/strategies",
            "src/auth/decorators",
            "src/auth/entities",
            "src/auth/interfaces",
            "src/auth/services",
        ];

        for (const dir of dirs) {
            fs.mkdirSync(path.join(process.cwd(), dir), {
                recursive: true,
            });
        }

        console.log("Auth preparado.");

    }

}
