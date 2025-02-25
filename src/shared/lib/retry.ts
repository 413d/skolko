type RetryConfig = {
  maxAttempts?: number;
  delay?: number;
  abortController?: AbortController;
};

export const withRetryAndTimeout = async <T>(
  fn: () => Promise<T>,
  { maxAttempts = 2, delay = 500, abortController }: RetryConfig = {},
): Promise<T> => {
  let lastError: unknown;

  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      abortController?.abort();
      reject(new DOMException('Timeout', 'TimeoutError'));
    }, delay * maxAttempts * 2);
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const result = await Promise.race([fn(), timeoutPromise] as const);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      lastError = error;
      if (error instanceof DOMException || attempt === maxAttempts) {
        clearTimeout(timeoutId);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};
