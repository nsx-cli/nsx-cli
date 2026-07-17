import { execSync } from "node:child_process";
import path from "node:path";
import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class MigrationRenderer implements IRenderer {

    readonly name = "Migration";
    readonly priority = 100;

    async render(_: DomainModel): Promise<void> {

        const schema = path.join(
            process.cwd(),
            "src",
            "erp",
            "generated",
            "schema.prisma",
        );

        console.log("▶ Prisma Format");
        execSync(
            `npx prisma format --schema="${schema}"`,
            { stdio: "inherit" },
        );

        console.log("▶ Prisma Generate");
        execSync(
            `npx prisma generate --schema="${schema}"`,
            { stdio: "inherit" },
        );

        if (!process.env.DATABASE_URL) {
            console.log("⚠ DATABASE_URL não configurada.");
            console.log("⚠ Migração ignorada.");
            return;
        }

        console.log("▶ Prisma Migrate");
        execSync(
            `npx prisma migrate dev --schema="${schema}" --name auto`,
            { stdio: "inherit" },
        );

        console.log("✔ Migration concluída");
    }

}
