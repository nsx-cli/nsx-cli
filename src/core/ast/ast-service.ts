import { ClassDeclaration, Decorator, ImportDeclaration, SourceFile } from "ts-morph";
import { AstLocator, FindClassOptions, FindDecoratorOptions, FindModuleOptions, FindSourceFileOptions } from "./ast-locator";
import { AstMutator, AddControllerOptions, AddImportOptions, AddProviderOptions } from "./ast-mutator";
import { AstPersistenceService } from "./ast-persistence.service";
import { AstProjectContext, OpenProjectOptions } from "./ast-project-context";

export class AstService {
  constructor(
    private readonly projectContext: AstProjectContext,
    private readonly locator: AstLocator,
    private readonly mutator: AstMutator,
    private readonly persistence: AstPersistenceService
  ) {}

  public openProject(options: OpenProjectOptions): void {
    this.projectContext.open(options);
  }

  public findSourceFile(options: FindSourceFileOptions): SourceFile | undefined {
    return this.locator.findSourceFile(options);
  }

  public findClass(options: FindClassOptions): ClassDeclaration | undefined {
    return this.locator.findClass(options);
  }

  public findDecorator(options: FindDecoratorOptions): Decorator | undefined {
    return this.locator.findDecorator(options);
  }

  public findModule(options: FindModuleOptions): ClassDeclaration | undefined {
    return this.locator.findModule(options);
  }

  public addImport(options: AddImportOptions): ImportDeclaration {
    return this.mutator.addImport(options);
  }

  public addProvider(options: AddProviderOptions): void {
    this.mutator.addProvider(options);
  }

  public addController(options: AddControllerOptions): void {
    this.mutator.addController(options);
  }

  public save(sourceFile: SourceFile): Promise<void> {
    return this.persistence.save({ sourceFile });
  }

  public saveAll(): Promise<void> {
    return this.persistence.saveAll();
  }
}
