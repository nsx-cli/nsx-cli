import path from "path";
import { Project } from "ts-morph";
import { AstProjectContext } from "../ast/ast-project-context";
import { FileService } from "../../services/file.service";
import { ProjectScanner } from "../../services/project-scanner.service";
import { GraphBuilder } from "./graph-builder";
import { GraphFormatter } from "./graph-formatter";
import { GraphExecutionResult, GraphRunOptions } from "./graph.types";

export class GraphService {
  constructor(
    private readonly scanner: ProjectScanner = new ProjectScanner(process.cwd()),
    private readonly projectContext: AstProjectContext = new AstProjectContext(),
    private readonly builder: GraphBuilder = new GraphBuilder(),
    private readonly formatter: GraphFormatter = new GraphFormatter(),
    private readonly fileService: FileService = new FileService()
  ) {}

  public async run(options: GraphRunOptions = {}): Promise<GraphExecutionResult> {
    const projectInfo = await this.scanner.scan();
    const project = await this.createProject(projectInfo.tsconfigPath, projectInfo.rootDir);
    const report = this.builder.build(project, projectInfo);
    const outputPath = options.outputPath ?? path.resolve(projectInfo.rootDir, ".nsx", "graph-report.md");
    const markdown = this.formatter.format(report, outputPath);

    await this.fileService.ensureDirectory(path.dirname(outputPath));
    await this.fileService.writeFile(outputPath, markdown);

    return {
      report,
      markdown,
      outputPath,
    };
  }

  private async createProject(tsconfigPath: string | null, rootDir: string): Promise<Project> {
    if (tsconfigPath !== null) {
      return this.projectContext.open({ tsConfigFilePath: tsconfigPath });
    }

    const project = new Project({ skipAddingFilesFromTsConfig: true });
    const sourceFiles = await this.fileService.find(path.join(rootDir, "src", "**", "*.ts"));

    for (const sourceFile of sourceFiles) {
      if (!sourceFile.endsWith(".d.ts")) {
        project.addSourceFileAtPath(sourceFile);
      }
    }

    return project;
  }
}
