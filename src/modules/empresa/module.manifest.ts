import fs from "node:fs";
import path from "node:path";
import { InstallerContext } from "../../installer/installer.context";
import { ModuleManifest } from "../../installer/module-manifest";

const manifest: ModuleManifest = {

    name: "Empresa",

    async install(_context: InstallerContext): Promise<void> {

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

    },

};

export default manifest;
