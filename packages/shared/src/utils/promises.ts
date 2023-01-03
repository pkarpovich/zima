export const runFunctionWithRetry = async (
  func: () => Promise<void>,
  beforeRetry: () => Promise<void>
) => {
  try {
    await func();
  } catch {
    await beforeRetry();
    await func();
  }
};
