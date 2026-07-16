import { ArrayLiteralExpression, Node, ObjectLiteralExpression, SourceFile } from "ts-morph";

export function resolveModuleMetadataObject(sourceFile: SourceFile): ObjectLiteralExpression {
  const moduleClass = sourceFile
    .getClasses()
    .find((classDeclaration) => classDeclaration.getDecorator("Module") !== undefined);

  if (moduleClass === undefined) {
    throw new Error("Module class with @Module decorator was not found");
  }

  const moduleDecorator = moduleClass.getDecorator("Module");

  if (moduleDecorator === undefined) {
    throw new Error("@Module decorator was not found");
  }

  const callExpression = moduleDecorator.getCallExpression();

  if (callExpression === undefined) {
    throw new Error("@Module decorator call expression was not found");
  }

  const firstArgument = callExpression.getArguments()[0];

  if (firstArgument === undefined || !Node.isObjectLiteralExpression(firstArgument)) {
    throw new Error("@Module metadata object was not found");
  }

  return firstArgument;
}

export function ensureArrayProperty(metadataObject: ObjectLiteralExpression, propertyName: string): ArrayLiteralExpression {
  const property = metadataObject.getProperty(propertyName);

  if (property === undefined) {
    metadataObject.addPropertyAssignment({
      name: propertyName,
      initializer: "[]",
    });
  }

  const resolvedProperty = metadataObject.getProperty(propertyName);

  if (resolvedProperty === undefined || !Node.isPropertyAssignment(resolvedProperty)) {
    throw new Error(`${propertyName} property is invalid`);
  }

  const initializer = resolvedProperty.getInitializer();

  if (initializer === undefined || !Node.isArrayLiteralExpression(initializer)) {
    throw new Error(`${propertyName} metadata must be an array`);
  }

  return initializer;
}

export function ensureNamedImport(sourceFile: SourceFile, importName: string, moduleSpecifier: string): void {
  const declaration = sourceFile.getImportDeclaration((entry) => entry.getModuleSpecifierValue() === moduleSpecifier);

  if (declaration === undefined) {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: [importName],
    });
    return;
  }

  const hasImport = declaration.getNamedImports().some((entry) => entry.getName() === importName);

  if (!hasImport) {
    declaration.addNamedImport(importName);
  }
}