import promiseRetry from "promise-retry";
import { LoggerService } from "shared/services/logger-service.mjs";

const loggerService = new LoggerService();

export function retry(
  fn,
  options = { retries: 10, factor: 2, minTimeout: 60000 }
) {
  return promiseRetry((retry, number) => {
    return fn().catch(() => {
      loggerService.warn(
        `Retry in ${(number * options.minTimeout) / 1000} seconds`
      );
      retry();
    });
  }, options);
}
