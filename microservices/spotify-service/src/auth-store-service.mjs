const DEFAULT_VALUE = { refreshToken: null };

export class AuthStoreService {
  #store = null;

  constructor(store) {
    this.#store = store;
  }

  readFile() {
    return this.#store.read();
  }

  saveFile() {
    return this.#store.write();
  }

  async init() {
    await this.readFile();

    this.#store.data = this.#store.data || DEFAULT_VALUE;
  }

  get() {
    return this.#store.data;
  }

  set(newValue) {
    this.#store.data = newValue;
    this.saveFile();

    return this.#store.data;
  }
}
