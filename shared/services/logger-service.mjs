import signale from "signale";
const { Signale } = signale;

export class LoggerService {
  #logger = null;

  #context = null;

  get defaultContext() {
    return {
      scope: this.#logger,
    };
  }

  constructor() {
    signale.config({
      displayTimestamp: true,
      displayDate: true,
    });
    this.#logger = signale.scope("global");
  }

  set context(value) {
    this.#context = value;
  }

  get context() {
    return this.#context || this.defaultContext;
  }

  log(...message) {
    this.context.scope.info(...message);
  }

  info(...message) {
    this.context.scope.info(...message);
  }

  warn(...message) {
    this.context.scope.warn(...message);
  }

  success(...message) {
    this.context.scope.success(...message);
  }

  error(...message) {
    this.context.scope.error(...message);
  }

  await(...message) {
    this.context.scope.await(...message);
  }

  createScope(name) {
    return signale.scope(name);
  }
}
