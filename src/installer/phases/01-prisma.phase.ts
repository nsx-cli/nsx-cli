import fs from "node:fs";
import path from "node:path";
import { InstallerPhase } from "../installer.phase";

export class PrismaPhase implements InstallerPhase {

    readonly name = "Prisma";

    async execute(): Promise<void> {

        const prismaDir = path.join(process.cwd(),"prisma");

        fs.mkdirSync(prismaDir,{
            recursive:true,
        });

        const schema = path.join(prismaDir,"schema.prisma");

        if(!fs.existsSync(schema)){

            fs.writeFileSync(schema,`
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`.trimStart(),"utf8");

        }

        console.log("Prisma preparado.");

    }

}
