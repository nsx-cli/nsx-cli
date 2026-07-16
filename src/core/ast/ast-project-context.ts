import { Directory, Project, SourceFile } from "ts-morph";

export interface OpenProjectOptions {
  tsConfigFilePath: string;
  skipAddingFilesFromTsConfig?: boolean;
}

export class AstProjectContext {
  private project: Project | undefined;

  public open(options: OpenProjectOptions): Project {
    this.project = new Project({
      tsConfigFilePath: options.tsConfigFilePath,
      skipAddingFilesFromTsConfig: options.skipAddingFilesFromTsConfig,
    });

    return this.project;
  }

  public getProject(): Project {
    if (this.project === undefined) {
      throw new Error("Project is not initialized");
    }

    return this.project;
  }

  public addSourceFile(filePath: string): SourceFile {
    return this.getProject().addSourceFileAtPath(filePath);
  }

  public getSourceFile(filePath: string): SourceFile | undefined {
    return this.getProject().getSourceFile(filePath);
  }

  public getSourceFiles(): readonly SourceFile[] {
    return this.getProject().getSourceFiles();
  }

  public getDirectory(directoryPath: string): Directory | undefined {
    return this.getProject().getDirectory(directoryPath);
  }

  public saveProject(): Promise<void> {
    return this.getProject().save();
  }
}
