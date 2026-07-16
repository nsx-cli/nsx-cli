import { pathExists, readJson } from "fs-extra";
import path from "path";

export interface ProjectScannerResult {
  rootDir: string;
  packageJsonPath: string | null;
  tsconfigPath: string | null;
  nestCliPath: string | null;
  packageJson: Record<string, unknown> | null;
  tsconfig: Record<string, unknown> | null;
  nestCli: Record<string, unknown> | null;
  isNestJs: boolean;
  usesPrisma: boolean;
  usesTypeORM: boolean;
}

export class ProjectScanner {
  constructor(private readonly rootDir: string = process.cwd()) {}

  async scan(): Promise<ProjectScannerResult> {
    const packageJsonPath = path.join(this.rootDir, "package.json");
    const tsconfigPath = path.join(this.rootDir, "tsconfig.json");
    const nestCliPath = path.join(this.rootDir, "nest-cli.json");

    const packageJson = await this.readJsonFile(packageJsonPath);
    const tsconfig = await this.readJsonFile(tsconfigPath);
    const nestCli = await this.readJsonFile(nestCliPath);

    const dependencies = this.getDependencies(packageJson);
    const devDependencies = this.getDevDependencies(packageJson);

    const isNestJs = Boolean(
      dependencies["@nestjs/core"] ||
        dependencies["@nestjs/common"] ||
        dependencies["@nestjs/cli"] ||
        dependencies["@nestjs/platform-express"] ||
        nestCli
    );

    const usesPrisma = Boolean(
      dependencies.prisma ||
        dependencies["@prisma/client"] ||
        devDependencies.prisma ||
        devDependencies["@prisma/client"]
    );

    const usesTypeORM = Boolean(
      dependencies.typeorm ||
        dependencies["@nestjs/typeorm"] ||
        devDependencies.typeorm ||
        devDependencies["@nestjs/typeorm"]
    );

    return {
      rootDir: this.rootDir,
      packageJsonPath: (await pathExists(packageJsonPath)) ? packageJsonPath : null,
      tsconfigPath: (await pathExists(tsconfigPath)) ? tsconfigPath : null,
      nestCliPath: (await pathExists(nestCliPath)) ? nestCliPath : null,
      packageJson,
      tsconfig,
      nestCli,
      isNestJs,
      usesPrisma,
      usesTypeORM,
    };
  }

  private async readJsonFile(filePath: string): Promise<Record<string, unknown> | null> {
    if (!(await pathExists(filePath))) {
      return null;
    }

    return readJson(filePath) as Promise<Record<string, unknown>>;
  }

  private getDependencies(packageJson: Record<string, unknown> | null): Record<string, unknown> {
    return this.getSection(packageJson, "dependencies");
  }

  private getDevDependencies(packageJson: Record<string, unknown> | null): Record<string, unknown> {
    return this.getSection(packageJson, "devDependencies");
  }

  private getSection(packageJson: Record<string, unknown> | null, sectionName: string): Record<string, unknown> {
    if (!packageJson || !this.isRecord(packageJson[sectionName])) {
      return {};
    }

    return packageJson[sectionName] as Record<string, unknown>;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
