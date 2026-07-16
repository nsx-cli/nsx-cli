import { ConfigService } from '../config/config.service';
import { ProjectScanner } from './project-scanner.service';
import { TemplateRegistry } from './template-registry.service';

export interface ProjectContextData {
  project: Record<string, unknown>;
  paths: Record<string, unknown>;
  templates: Record<string, unknown>;
  prisma: Record<string, unknown>;
  nest: Record<string, unknown>;
  typescript: Record<string, unknown>;
}

export class ProjectContext {
  private static instance: ProjectContext | null = null;
  private loaded = false;
  private data!: ProjectContextData;

  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly scanner: ProjectScanner = new ProjectScanner(
      process.cwd(),
    ),
    private readonly configService: ConfigService = new ConfigService(
      process.cwd(),
    ),
    private readonly templateRegistry: TemplateRegistry = new TemplateRegistry(),
  ) {}

  async load(): Promise<ProjectContextData> {
    if (this.loaded) {
      return this.data;
    }

    const project = await this.scanner.scan();
    await this.configService.load();
    const cacheDir = await this.configService.ensureCacheDir();

    this.data = {
      project: {
        rootDir: project.rootDir,
        packageJson: project.packageJson,
        isNestJs: project.isNestJs,
        usesPrisma: project.usesPrisma,
        usesTypeORM: project.usesTypeORM,
      },
      paths: {
        rootDir: this.rootDir,
        cacheDir,
        packageJsonPath: project.packageJsonPath,
        tsconfigPath: project.tsconfigPath,
        nestCliPath: project.nestCliPath,
      },
      templates: {
        registry: this.templateRegistry,
      },
      prisma: {
        enabled: project.usesPrisma,
      },
      nest: {
        enabled: project.isNestJs,
        config: project.nestCli,
      },
      typescript: {
        config: project.tsconfig,
        tsconfigPath: project.tsconfigPath,
      },
    };

    this.loaded = true;
    return this.data;
  }

  static async getInstance(): Promise<ProjectContext> {
    if (!ProjectContext.instance) {
      ProjectContext.instance = new ProjectContext();
    }

    await ProjectContext.instance.load();
    return ProjectContext.instance;
  }
}
