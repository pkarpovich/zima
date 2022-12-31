import mongoose from "mongoose";
import { ConfigService, LoggerService } from "shared/src/services.js";
import { Nullable } from "shared/src/types.js";
import { IConfig } from "../config/config.js";

export class Database {
  private connection: Nullable<typeof mongoose> = null;

  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly loggerService: LoggerService
  ) {}

  async connect() {
    const connectionString = this.configService.get<string>(
      "Database.ConnectionString"
    );

    this.connection = await mongoose.connect(connectionString);
    this.loggerService.log("Database connected");
  }

  async disconnect() {
    await mongoose.connection.close();
  }
}
