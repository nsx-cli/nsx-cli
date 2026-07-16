import path from "path";
import { FileService } from "../../services/file.service";
import { DocumentationCollector } from "./documentation-collector";
import { DocumentationFormatter } from "./documentation-formatter";
import { DocumentationExecutionResult } from "./documentation.types";

export interface DocumentationRunOptions {
  outputPath?: string;
}

export class DocumentationService {
  constructor(
    private readonly collector: DocumentationCollector = new DocumentationCollector(),
    private readonly formatter: DocumentationFormatter = new DocumentationFormatter(),
    private readonly fileService: FileService = new FileService()
  ) {}

  public async generate(options: DocumentationRunOptions = {}): Promise<DocumentationExecutionResult> {
    const snapshot = await this.collector.collect();
    const outputPath = options.outputPath ?? path.resolve(snapshot.project.rootDir, ".nsx", "documentation.md");
    const markdown = this.formatter.format(snapshot, outputPath);

    await this.fileService.ensureDirectory(path.dirname(outputPath));
    await this.fileService.writeFile(outputPath, markdown);

    return {
      outputPath,
      markdown,
      snapshot,
    };
  }
}