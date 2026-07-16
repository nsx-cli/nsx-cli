import { copy, ensureDir, ensureFile, pathExists, readFile, remove, rename, writeFile, readdir, glob, readJson, writeJson } from "fs-extra";
import path from "path";

export class FileSystem {
  async read(filePath: string): Promise<string> {
    return readFile(filePath, "utf8");
  }

  async write(filePath: string, content: string): Promise<void> {
    await ensureFile(filePath);
    await writeFile(filePath, content, "utf8");
  }

  async exists(filePath: string): Promise<boolean> {
    return pathExists(filePath);
  }

  async copy(from: string, to: string): Promise<void> {
    await ensureDir(path.dirname(to));
    await copy(from, to);
  }

  async move(from: string, to: string): Promise<void> {
    await ensureDir(path.dirname(to));
    await rename(from, to);
  }

  async remove(filePath: string): Promise<void> {
    await remove(filePath);
  }

  async mkdir(dirPath: string): Promise<void> {
    await ensureDir(dirPath);
  }

  async find(pattern: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(pattern, (error, matches) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(matches);
      });
    });
  }

  async list(directory: string): Promise<string[]> {
    return readdir(directory);
  }

  async readJson(filePath: string): Promise<unknown> {
    return readJson(filePath);
  }

  async writeJson(filePath: string, data: unknown): Promise<void> {
    await ensureFile(filePath);
    await writeJson(filePath, data, { spaces: 2 });
  }
}
