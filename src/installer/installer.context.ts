import { ApplicationContext } from "../core/application/application-context";
import { CrudGenerator } from "../core/crud/crud-generator";

export class InstallerContext {

    readonly startedAt = new Date();

    readonly root = process.cwd();

    private applicationContext?: ApplicationContext;

    setApplicationContext(context: ApplicationContext): void {
        this.applicationContext = context;
    }

    getApplicationContext(): ApplicationContext {

        if (!this.applicationContext) {
            throw new Error("ApplicationContext não configurado.");
        }

        return this.applicationContext;

    }

    getCrudGenerator(): CrudGenerator {
        return this.getApplicationContext().resolve(CrudGenerator);
    }

}
