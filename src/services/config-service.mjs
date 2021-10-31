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
