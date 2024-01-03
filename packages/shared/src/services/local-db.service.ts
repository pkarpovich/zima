import { join } from "node:path";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";

import { ConfigService } from "./config.service.js";
import { FilesService } from "./files.service.js";

export class LocalDbService<T> {
  // @ts-ignore
  private db: Low<T> = null;

  constructor(
    private readonly initialData: T,
    private readonly configService: ConfigService<unknown>,
    private readonly filesService: FilesService
  ) {}

  async start(): Promise<void> {
    const dbPath = this.configService.get<string>("dbPath");

    const file = join(dbPath);
    const fileFolderPath = file.split("/").slice(0, -1).join("/");
    if (fileFolderPath) {
      await this.filesService.createFolderIfNeeded(fileFolderPath);
    }

    this.db = await JSONFilePreset(file, this.initialData);
  }

  async save(): Promise<void> {
    return this.db.write();
  }

  get(): T {
    return this.db.data;
  }

  async set(newValue: T): Promise<T | null> {
    this.db.data = newValue;
    await this.save();

    return this.db.data;
  }
}
