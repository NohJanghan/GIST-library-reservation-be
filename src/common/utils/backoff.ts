const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps a list of promise-returning functions with exponential backoff and jitter retry logic.
 *
 * @param tasks An array of functions that each return a Promise.
 * @param baseDelay The base delay in milliseconds for the backoff calculation. Defaults to 100ms.
 * @param maxDelay The maximum delay in milliseconds. Defaults to 10000ms.
 * @param maxTrial The maximum number of trials for each task. Defaults to 3.
 * @returns An array of Promises, where each promise will retry upon failure according to the backoff strategy.
 *          This array can be used with `Promise.all`.
 */
export const backoff = <T>(
  tasks: (() => Promise<T>)[],
  baseDelay = 100,
  maxDelay = 10000,
  maxTrial = 4
): Promise<T>[] => {
  const retry = async (task: () => Promise<T>): Promise<T> => {
    for (let trial = 1; trial <= maxTrial; trial++) {
      try {
        return await task();
      } catch (error) {
        if (trial === maxTrial) {
          throw error;
        }
        const backoffDelay = Math.min(maxDelay, baseDelay * (2 ** (trial - 1)));
        const jitter = Math.random() * backoffDelay;
        await sleep(jitter);
      }
    }
    // This line should not be reachable.
    throw new Error("backoff: Max trials reached, but the loop exited unexpectedly.");
  };

  return tasks.map(task => retry(task));
};
