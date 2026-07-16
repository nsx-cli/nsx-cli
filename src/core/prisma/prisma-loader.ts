import path from 'path';
import { readFile, stat } from 'fs/promises';
import { SchemaNotFoundException } from './exceptions/schema-not-found.exception';
import { SchemaReadException } from './exceptions/schema-read.exception';

export interface PrismaLoaderOptions {
  schemaPath?: string;
}

export interface PrismaSchemaFile {
  path: string;
  content: string;
}

export class PrismaLoader {
  public async load(
    options: PrismaLoaderOptions = {},
  ): Promise<PrismaSchemaFile> {
    const resolvedSchemaPath = await this.resolveSchemaPath(options);

    try {
      const content = await readFile(resolvedSchemaPath, 'utf8');

      return {
        path: resolvedSchemaPath,
        content,
      };
    } catch (error) {
      throw new SchemaReadException(resolvedSchemaPath, error);
    }
  }

  public async resolveSchemaPath(
    options: PrismaLoaderOptions = {},
  ): Promise<string> {
    if (options.schemaPath !== undefined) {
      const customSchemaPath = path.resolve(process.cwd(), options.schemaPath);
      await this.assertFileExists(customSchemaPath);
      return customSchemaPath;
    }

    const foundSchemaPath = await this.findSchemaPathFrom(process.cwd());

    if (foundSchemaPath === undefined) {
      throw new SchemaNotFoundException(process.cwd());
    }

    return foundSchemaPath;
  }

  private async findSchemaPathFrom(
    startDir: string,
  ): Promise<string | undefined> {
    let currentDir = path.resolve(startDir);

    while (true) {
      const directSchemaPath = path.join(currentDir, 'schema.prisma');
      if (await this.fileExists(directSchemaPath)) {
        return directSchemaPath;
      }

      const prismaSchemaPath = path.join(currentDir, 'prisma', 'schema.prisma');
      if (await this.fileExists(prismaSchemaPath)) {
        return prismaSchemaPath;
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        return undefined;
      }

      currentDir = parentDir;
    }
  }

  private async assertFileExists(filePath: string): Promise<void> {
    if (!(await this.fileExists(filePath))) {
      throw new SchemaNotFoundException(filePath);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await stat(filePath);
      return fileInfo.isFile();
    } catch {
      return false;
    }
  }
}
