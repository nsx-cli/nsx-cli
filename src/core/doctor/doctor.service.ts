import path from "path";
import { Project } from "ts-morph";
import { FileService } from "../../services/file.service";
import { ProjectScanner, ProjectScannerResult } from "../../services/project-scanner.service";
import { DoctorAnalyzer } from "./doctor-analyzer";
import { DoctorExecutionResult } from "./doctor.types";
import { DoctorReportFormatter } from "./doctor-report-formatter";

export interface DoctorRunOptions {
  outputPath?: string;
}

export class DoctorService {
  constructor(
    private readonly scanner: ProjectScanner = new ProjectScanner(process.cwd()),
    private readonly analyzer: DoctorAnalyzer = new DoctorAnalyzer(),
    private readonly formatter: DoctorReportFormatter = new DoctorReportFormatter(),
    private readonly fileService: FileService = new FileService()
  ) {}

  public async run(options: DoctorRunOptions = {}): Promise<DoctorExecutionResult> {
    const projectInfo = await this.scanner.scan();
    const project = await this.createProject(projectInfo);
    const report = await this.analyzer.analyze(project, projectInfo);
    const outputPath = options.outputPath ?? path.resolve(projectInfo.rootDir, ".nsx", "doctor-report.md");
    const markdown = this.formatter.format(report, outputPath);

    await this.writeReport(outputPath, markdown);

    return {
      report,
      markdown,
      outputPath,
    };
  }

  private async createProject(projectInfo: ProjectScannerResult): Promise<Project> {
    if (projectInfo.tsconfigPath) {
      return new Project({ tsConfigFilePath: projectInfo.tsconfigPath });
    }

    const project = new Project({ skipAddingFilesFromTsConfig: true });
    const sourceFiles = await this.fileService.find(path.join(projectInfo.rootDir, "src", "**", "*.ts"));

    for (const sourceFile of sourceFiles) {
      if (!sourceFile.endsWith(".d.ts")) {
        project.addSourceFileAtPath(sourceFile);
      }
    }

    return project;
  }

  private async writeReport(outputPath: string, markdown: string): Promise<void> {
    await this.fileService.ensureDirectory(path.dirname(outputPath));
    await this.fileService.writeFile(outputPath, markdown);
  }
}