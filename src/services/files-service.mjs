export class FilesService {
  #fs = null;

  constructor(fs) {
    this.#fs = fs;
  }

  async getDirFiles(folderPath) {
    return this.#fs.readdir(folderPath);
  }
}
