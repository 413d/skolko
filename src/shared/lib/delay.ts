export const debounce = <T extends unknown[]>(
  func: (...args: T) => unknown,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
