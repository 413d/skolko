type RetryConfig = {
  /** Maximum number of retry attempts (default: 2) */
  maxAttempts?: number;
  /** Delay between retries in ms, multiplied by attempt number (default: 500) */
  retryDelay?: number;
  /** Timeout for each individual request in ms (default: 10000) */
  requestTimeout?: number;
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new DOMException('Request timeout', 'TimeoutError'));
      }, timeoutMs);
    }),
  ]);
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  {
    maxAttempts = 2,
    retryDelay = 500,
    requestTimeout = 10000,
  }: RetryConfig = {},
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout(fn(), requestTimeout);
    } catch (error) {
      lastError = error;

      // Don't retry on timeout or if it's the last attempt
      const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
      if (isTimeout || attempt === maxAttempts) {
        break;
      }

      // Exponential backoff: retryDelay * attempt
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw lastError;
};
