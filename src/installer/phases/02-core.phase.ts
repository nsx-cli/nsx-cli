import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class CorePhase implements InstallerPhase {

    readonly name = "Core";

    async execute(): Promise<void> {

        const dirs = [
            "src/common",
            "src/common/decorators",
            "src/common/dto",
            "src/common/guards",
            "src/common/interceptors",
            "src/common/filters",
            "src/common/pipes",
            "src/common/exceptions",
            "src/common/interfaces",
            "src/common/utils",
            "src/config",
            "src/core",
            "src/database",
            "src/prisma",
            "src/modules",
            "src/shared",
            "src/uploads",
            "logs"
        ];

        for (const dir of dirs) {
            fs.mkdirSync(
                path.join(process.cwd(), dir),
                { recursive: true },
            );
        }

        console.log("Core preparado.");

    }

}
