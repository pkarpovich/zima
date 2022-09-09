import promiseRetry from "promise-retry";

export function retry(
  fn,
  options = { retries: 10, factor: 2, minTimeout: 60000 }
) {
  return promiseRetry((retry, number) => {
    return fn().catch(() => {
      console.log(`Retry in ${(number * options.minTimeout) / 1000} seconds`);
      retry();
    });
  }, options);
}
