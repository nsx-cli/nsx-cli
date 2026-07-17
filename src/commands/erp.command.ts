import { Command } from "commander";
import { ApplicationContext } from "../core/application/application-context";
import { ErpGenerator } from "../generators/erp.generator";
import { Installer } from "../installer/installer";
import { EnvironmentPhase } from "../installer/phases/00-environment.phase";
import { PrismaPhase } from "../installer/phases/01-prisma.phase";
import { CorePhase } from "../installer/phases/02-core.phase";
import { AuthPhase } from "../installer/phases/03-auth.phase";
import { KernelPhase } from "../installer/phases/04-kernel.phase";
import { AdminPhase } from "../installer/phases/05-admin.phase";
import { EmpresaPhase } from "../installer/phases/06-empresa.phase";
import { CrudModelsPhase } from "../installer/phases/07-crud-models.phase";

export class ErpCommand {

    constructor(
        private readonly generator: ErpGenerator,
        private readonly applicationContext: ApplicationContext,
    ) {}

    register(program: Command): void {

        const erp = program
            .command("erp")
            .description("NSX ERP");

        erp
            .command("install")
            .description("Instala toda a estrutura do ERP")
            .action(async () => {

                const installer = new Installer();

                installer.getContext().setApplicationContext(this.applicationContext);

                installer.register(new EnvironmentPhase());
                installer.register(new PrismaPhase());
                installer.register(new CorePhase());
                installer.register(new AuthPhase());
                installer.register(new KernelPhase());
                installer.register(new AdminPhase());
                installer.register(new EmpresaPhase());
                installer.register(new CrudModelsPhase());

                await installer.run();

            });

        erp
            .command("create <name>")
            .description("Cria um módulo ERP")
            .action(async (name: string) => {

                await this.generator.generate(name);

            });

        erp
            .command("module <name>")
            .description("Alias para create")
            .action(async (name: string) => {

                await this.generator.generate(name);

            });

    }

}
