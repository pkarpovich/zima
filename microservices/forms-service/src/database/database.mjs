import mongoose from "mongoose";

export class Database {
  #configService = null;

  #connection = null;

  constructor({ configService }) {
    this.#configService = configService;
  }

  async connect() {
    const connectionString = this.#configService.get(
      "Database.ConnectionString"
    );

    this.#connection = await mongoose.connect(connectionString);
  }

  async disconnect() {
    await mongoose.connection.close();
  }
}
