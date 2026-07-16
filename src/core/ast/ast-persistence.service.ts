import { SourceFile } from "ts-morph";
import { AstProjectContext } from "./ast-project-context";

export interface SaveOptions {
  sourceFile: SourceFile;
}

export interface FormatOptions {
  sourceFile: SourceFile;
}

export class AstPersistenceService {
  constructor(private readonly projectContext: AstProjectContext) {}

  public save(options: SaveOptions): Promise<void> {
    return options.sourceFile.save();
  }

  public saveAll(): Promise<void> {
    return this.projectContext.saveProject();
  }

  public async format(_options: FormatOptions): Promise<void> {
    return Promise.resolve();
  }
}
