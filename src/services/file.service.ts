import { FileSystem } from './file-system.service';

export class FileService {
  private readonly fileSystem = new FileSystem();

  async ensureDirectory(dirPath: string): Promise<void> {
    await this.fileSystem.mkdir(dirPath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await this.fileSystem.write(filePath, content);
  }

  async exists(filePath: string): Promise<boolean> {
    return this.fileSystem.exists(filePath);
  }

  async read(filePath: string): Promise<string> {
    return this.fileSystem.read(filePath);
  }

  async copy(from: string, to: string): Promise<void> {
    await this.fileSystem.copy(from, to);
  }

  async move(from: string, to: string): Promise<void> {
    await this.fileSystem.move(from, to);
  }

  async remove(path: string): Promise<void> {
    await this.fileSystem.remove(path);
  }

  async find(pattern: string): Promise<string[]> {
    return this.fileSystem.find(pattern);
  }

  async list(directory: string): Promise<string[]> {
    return this.fileSystem.list(directory);
  }

  async readJson(filePath: string): Promise<unknown> {
    return this.fileSystem.readJson(filePath);
  }

  async writeJson(filePath: string, data: unknown): Promise<void> {
    await this.fileSystem.writeJson(filePath, data);
  }
}
