export class LoggerService {
  #logger = null;

  constructor({ logger = console }) {
    this.#logger = logger;
  }

  log(message) {
    this.#logger.log(`[INFO] ${message}`);
  }

  warn(message) {
    this.#logger.warn(`[WARNING] ${message}`);
  }

  error(message) {
    this.#logger.error(`[ERROR] ${message}`);
  }
}
