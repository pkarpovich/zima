import signale, { Signale } from "signale";

export interface LoggerContext {
  scope: Signale;
}

export class LoggerService {
  private readonly logger: Signale;

  get defaultContext() {
    return {
      scope: this.logger,
    };
  }

  constructor() {
    signale.config({
      displayTimestamp: true,
      displayDate: true,
    });
    this.logger = signale.scope("global");
  }

  log(message: string, context: LoggerContext = this.defaultContext): void {
    context.scope.info(message);
  }

  info(message: string, context: LoggerContext = this.defaultContext): void {
    context.scope.info(message);
  }

  warn(message: string, context: LoggerContext = this.defaultContext): void {
    context.scope.warn(message);
  }

  success(message: string, context: LoggerContext = this.defaultContext): void {
    context.scope.success(message);
  }

  error(
    message: string | Error,
    context: LoggerContext = this.defaultContext
  ): void {
    context.scope.error(message);
  }

  await(message: string, context: LoggerContext = this.defaultContext): void {
    context.scope.await(message);
  }

  createScope(name: string): Signale {
    return signale.scope(name);
  }
}
