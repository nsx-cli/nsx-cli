import { ClassDeclaration, Decorator, Node, SourceFile } from "ts-morph";
import { AstProjectContext } from "./ast-project-context";

export interface FindSourceFileOptions {
  filePath: string;
}

export interface FindClassOptions {
  sourceFile: SourceFile;
  className: string;
}

export interface FindDecoratorOptions {
  target: ClassDeclaration | Node;
  decoratorName: string;
}

export interface FindModuleOptions {
  sourceFile: SourceFile;
  className?: string;
}

export class AstLocator {
  constructor(private readonly projectContext: AstProjectContext) {}

  public findSourceFile(options: FindSourceFileOptions): SourceFile | undefined {
    return this.projectContext.getSourceFile(options.filePath);
  }

  public findClass(options: FindClassOptions): ClassDeclaration | undefined {
    return options.sourceFile.getClass(options.className);
  }

  public findDecorator(options: FindDecoratorOptions): Decorator | undefined {
    if (Node.isClassDeclaration(options.target)) {
      return options.target.getDecorator(options.decoratorName);
    }

    return options.target.getFirstDescendant(
      (entry) => Node.isDecorator(entry) && entry.getName() === options.decoratorName
    ) as Decorator | undefined;
  }

  public findModule(options: FindModuleOptions): ClassDeclaration | undefined {
    if (options.className !== undefined) {
      const classDeclaration = options.sourceFile.getClass(options.className);

      if (classDeclaration?.getDecorator("Module") !== undefined) {
        return classDeclaration;
      }
    }

    return options.sourceFile
      .getClasses()
      .find((classDeclaration) => classDeclaration.getDecorator("Module") !== undefined);
  }
}
