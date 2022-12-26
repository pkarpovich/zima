import * as fs from "node:fs/promises";

export class FilesService {
  private readonly fileSystem: typeof fs;

  constructor(fileSystem: typeof fs) {
    this.fileSystem = fileSystem;
  }

  async getDirFiles(folderPath: string): Promise<string[]> {
    return this.fileSystem.readdir(folderPath);
  }
}
