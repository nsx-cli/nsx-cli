import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class KernelPhase implements InstallerPhase {

    readonly name = "Kernel";

    async execute(): Promise<void> {

        const dirs = [
            "src/kernel",
            "src/kernel/application",
            "src/kernel/config",
            "src/kernel/database",
            "src/kernel/cache",
            "src/kernel/events",
            "src/kernel/queue",
            "src/kernel/storage",
            "src/kernel/security",
            "src/kernel/http",
            "src/kernel/modules",
            "src/kernel/contracts",
            "src/kernel/decorators",
            "src/kernel/interfaces",
            "src/kernel/exceptions",
            "src/kernel/utils",
            "src/kernel/logger",
            "src/kernel/bootstrap"
        ];

        for (const dir of dirs) {
            fs.mkdirSync(
                path.join(process.cwd(), dir),
                { recursive: true },
            );
        }

        console.log("Kernel preparado.");

    }

}
