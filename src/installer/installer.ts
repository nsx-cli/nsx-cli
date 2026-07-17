import { InstallerContext } from "./installer.context";
import { InstallerPhase } from "./installer.phase";

export class Installer {

    private readonly phases: InstallerPhase[] = [];

    constructor(
        private readonly context = new InstallerContext(),
    ) {}

    register(phase: InstallerPhase): void {
        this.phases.push(phase);
    }

    getContext(): InstallerContext {
        return this.context;
    }

    async run(): Promise<void> {

        console.log("");
        console.log("=======================================");
        console.log(" NSX ERP INSTALLER");
        console.log("=======================================");
        console.log("");

        for (const phase of this.phases) {

            console.log("▶ " + phase.name);

            await phase.execute(this.context);

            console.log("✔ " + phase.name);
            console.log("");

        }

        console.log("=======================================");
        console.log(" ERP INSTALADO");
        console.log("=======================================");

    }

}
