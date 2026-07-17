export interface InstallerPhase {
    readonly name: string;
    execute(context: import("./installer.context").InstallerContext): Promise<void>;
}
