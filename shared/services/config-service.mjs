import * as dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "prod.env" : "local.env"
  ),
});

const resolvePath = (object, path) =>
  path.split(".").reduce((o, p) => o[p], object);

export class ConfigService {
  #config = null;

  constructor({ config }) {
    this.#config = config;
  }

  get(path) {
    return resolvePath(this.#config, path);
  }
}
