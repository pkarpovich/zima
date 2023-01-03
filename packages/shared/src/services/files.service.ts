import * as fs from "node:fs/promises";

export class FilesService {
  private readonly fileSystem: typeof fs;

  constructor(fileSystem: typeof fs) {
    this.fileSystem = fileSystem;
  }

  async getDirFiles(folderPath: string): Promise<string[]> {
    return this.fileSystem.readdir(folderPath);
  }

  async createFolderIfNeeded(path: string): Promise<string | undefined> {
    return this.fileSystem.mkdir(path, { recursive: true });
  }
}
