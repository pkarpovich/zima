type AsyncFunction<T> = () => Promise<T>;

export async function executeWithRetry<T>(
    fn: AsyncFunction<T>,
    expectedValue: T,
    maxAttempts: number = 3,
    waitTimes: number[] = [5000, 7000, 15000],
): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const result = await fn();
            if (result === expectedValue) {
                return result;
            }
        } catch (error: any) {
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
        }

        if (attempt < maxAttempts - 1) {
            await wait(waitTimes[attempt]);
        }
    }

    throw new Error(`Failed to achieve the expected value after ${maxAttempts} attempts`);
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
