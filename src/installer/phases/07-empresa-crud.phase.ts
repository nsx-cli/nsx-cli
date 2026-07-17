import { InstallerContext } from "../installer.context";
import { InstallerPhase } from "../installer.phase";

export class EmpresaCrudPhase implements InstallerPhase {

    readonly name = "Empresa CRUD";

    async execute(context: InstallerContext): Promise<void> {

        await context.getCrudGenerator().generate("Empresa");

        console.log("CRUD Empresa preparado.");

    }

}
