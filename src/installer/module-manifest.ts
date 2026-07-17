import { InstallerContext } from "../installer/installer.context";

export interface ModuleManifest {

    readonly name: string;

    install(context: InstallerContext): Promise<void>;

}

