import path from "path";
import { Project } from "ts-morph";
import { PrismaDmmf } from "../prisma/prisma-dmmf";
import { PrismaLoader } from "../prisma/prisma-loader";
import { FileService } from "../../services/file.service";
import { ProjectScanner, ProjectScannerResult } from "../../services/project-scanner.service";
import { DocumentationPrismaSummary, DocumentationRoute, DocumentationSnapshot, DocumentationStructureSummary } from "./documentation.types";

export class DocumentationCollector {
  constructor(
    private readonly scanner: ProjectScanner = new ProjectScanner(process.cwd()),
    private readonly fileService: FileService = new FileService(),
    private readonly prismaLoader: PrismaLoader = new PrismaLoader(),
    private readonly prismaDmmf: PrismaDmmf = new PrismaDmmf()
  ) {}

  public async collect(): Promise<DocumentationSnapshot> {
    const project = await this.scanner.scan();
    const tsProject = await this.createProject(project);
    const sourceFiles = this.getWorkspaceSourceFiles(tsProject, project.rootDir);
    const structure = this.collectStructure(sourceFiles);
    const routes = this.collectRoutes(sourceFiles);
    const prisma = await this.collectPrisma(project);

    return {
      generatedAt: new Date().toISOString(),
      project,
      structure,
      routes,
      prisma,
    };
  }

  private async createProject(project: ProjectScannerResult): Promise<Project> {
    if (project.tsconfigPath) {
      return new Project({ tsConfigFilePath: project.tsconfigPath });
    }

    const tsProject = new Project({ skipAddingFilesFromTsConfig: true });
    const paths = await this.fileService.find(path.join(project.rootDir, "src", "**", "*.ts"));

    for (const filePath of paths) {
      if (!filePath.endsWith(".d.ts")) {
        tsProject.addSourceFileAtPath(filePath);
      }
    }

    return tsProject;
  }

  private getWorkspaceSourceFiles(project: Project, rootDir: string) {
    const normalizedRoot = this.normalizePath(rootDir);

    return project
      .getSourceFiles()
      .filter((sourceFile) => {
        const filePath = this.normalizePath(sourceFile.getFilePath());

        return filePath.startsWith(normalizedRoot) && !filePath.includes("/node_modules/") && !sourceFile.isDeclarationFile();
      });
  }

  private collectStructure(sourceFiles: ReturnType<DocumentationCollector["getWorkspaceSourceFiles"]>): DocumentationStructureSummary {
    let modules = 0;
    let controllers = 0;
    let services = 0;
    let repositories = 0;
    let entities = 0;
    let dtos = 0;

    for (const sourceFile of sourceFiles) {
      const fileName = sourceFile.getBaseName().toLowerCase();

      if (fileName.endsWith(".module.ts")) {
        modules += 1;
      }

      if (fileName.endsWith(".controller.ts")) {
        controllers += 1;
      }

      if (fileName.endsWith(".service.ts")) {
        services += 1;
      }

      if (fileName.endsWith(".repository.ts")) {
        repositories += 1;
      }

      if (fileName.endsWith(".entity.ts")) {
        entities += 1;
      }

      if (fileName.endsWith(".dto.ts")) {
        dtos += 1;
      }
    }

    return {
      sourceFiles: sourceFiles.length,
      modules,
      controllers,
      services,
      repositories,
      entities,
      dtos,
    };
  }

  private collectRoutes(sourceFiles: ReturnType<DocumentationCollector["getWorkspaceSourceFiles"]>): DocumentationRoute[] {
    const routes: DocumentationRoute[] = [];

    for (const sourceFile of sourceFiles) {
      for (const classDeclaration of sourceFile.getClasses()) {
        const controllerDecorator = classDeclaration.getDecorator("Controller");

        if (!controllerDecorator) {
          continue;
        }

        const args = controllerDecorator.getArguments();
        const basePath = args[0]?.getText().replace(/^['"`]|['"`]$/g, "") ?? "";

        routes.push({
          controller: classDeclaration.getName() ?? sourceFile.getBaseNameWithoutExtension(),
          filePath: sourceFile.getFilePath(),
          basePath,
        });
      }
    }

    return routes.sort((a, b) => a.controller.localeCompare(b.controller));
  }

  private async collectPrisma(project: ProjectScannerResult): Promise<DocumentationPrismaSummary> {
    if (!project.usesPrisma) {
      return {
        enabled: false,
        models: [],
        enums: [],
        errors: [],
      };
    }

    try {
      const schema = await this.prismaLoader.load();
      const dmmf = await this.prismaDmmf.generate(schema.content);

      return {
        enabled: true,
        schemaPath: schema.path,
        models: dmmf.datamodel.models.map((entry) => entry.name).sort(),
        enums: dmmf.datamodel.enums.map((entry) => entry.name).sort(),
        errors: [],
      };
    } catch (error) {
      return {
        enabled: true,
        models: [],
        enums: [],
        errors: [error instanceof Error ? error.message : "Erro desconhecido ao coletar informações do Prisma."],
      };
    }
  }

  private normalizePath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }
}