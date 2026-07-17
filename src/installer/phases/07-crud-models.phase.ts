import { PrismaEngine } from "../../core/prisma/prisma-engine";
import { InstallerContext } from "../installer.context";
import { InstallerPhase } from "../installer.phase";

export class CrudModelsPhase implements InstallerPhase {

    readonly name = "CRUD Models";

    async execute(context: InstallerContext): Promise<void> {

        const applicationContext = context.getApplicationContext();

        const prisma = applicationContext.resolve(PrismaEngine);
        const crud = context.getCrudGenerator();

        await prisma.load();

        for (const model of prisma.getModels()) {

            console.log(`Gerando CRUD: ${model.name}`);

            await crud.generate(model.name);

        }

    }

}
