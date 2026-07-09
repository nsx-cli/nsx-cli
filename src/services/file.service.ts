import fs from "fs-extra";

export class FileService {
  ensureDir(path: string) {
    fs.ensureDirSync(path);
  }

  write(file: string, content: string) {
    fs.writeFileSync(file, content, "utf8");
  }

  exists(file: string) {
    return fs.existsSync(file);
  }
}