import path from "path";
import { pascalCase } from "change-case";
import { SourceFile } from "ts-morph";
import { AstPersistenceService } from "../ast/ast-persistence.service";
import { AstProjectContext } from "../ast/ast-project-context";

export class ModuleCrudSupport {
  private readonly tsConfigFilePath: string;

  constructor(
    private readonly projectContext: AstProjectContext,
    private readonly persistenceService: AstPersistenceService,
    tsConfigFilePath?: string
  ) {
    this.tsConfigFilePath = tsConfigFilePath ?? path.resolve(process.cwd(), "tsconfig.json");
  }

  public loadModuleSourceFile(moduleName: string): SourceFile {
    this.projectContext.open({ tsConfigFilePath: this.tsConfigFilePath });
    return this.projectContext.addSourceFile(this.resolveModulePath(moduleName));
  }

  public saveModuleSourceFile(sourceFile: SourceFile): Promise<void> {
    return this.persistenceService.save({ sourceFile });
  }

  public resolveModulePath(moduleName: string): string {
    return path.resolve(process.cwd(), "src", "modules", moduleName, `${moduleName}.module.ts`);
  }

  public resolvePascalCase(value: string): string {
    return pascalCase(value);
  }
}
