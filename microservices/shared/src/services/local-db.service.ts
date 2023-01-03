import { join } from "node:path";
import { Low } from "lowdb";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { JSONFile } from "lowdb/node";

import { ConfigService } from "./config.service.js";
import { FilesService } from "./files.service.js";

export class LocalDbService<T> {
  private db: Low<T>;

  constructor(
    private readonly initialData: T,
    private readonly configService: ConfigService<unknown>,
    private readonly filesService: FilesService
  ) {
    const dbPath = this.configService.get<string>("dbPath");

    const file = join(dbPath);
    const fileFolderPath = file.split("/").slice(0, -1).join("/");
    if (fileFolderPath) {
      this.filesService.createFolderIfNeeded(fileFolderPath);
    }

    const adapter = new JSONFile<T>(file);
    this.db = new Low(adapter);
  }

  async start(): Promise<void> {
    await this.load();

    this.db.data ||= this.initialData;
  }

  async save(): Promise<void> {
    return this.db.write();
  }

  async load(): Promise<void> {
    return this.db.read();
  }

  get(): T {
    return this.db.data || this.initialData;
  }

  async set(newValue: T): Promise<T | null> {
    this.db.data = newValue;
    await this.save();

    return this.db.data;
  }
}
