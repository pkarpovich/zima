import promiseRetry from "promise-retry";

import { LoggerService } from "shared/src/services.js";

const loggerService = new LoggerService();

export function retry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: any,
  options = { retries: 10, factor: 2, minTimeout: 60000 }
) {
  return promiseRetry(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (retryFn: any, number) =>
      fn().catch(() => {
        loggerService.warn(
          `Retry in ${(number * options.minTimeout) / 1000} seconds`
        );
        retryFn();
      }),
    options
  );
}
