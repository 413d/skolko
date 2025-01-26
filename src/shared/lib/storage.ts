export const getStorageData = <T = unknown>(key: string, defaultValue?: T) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) as T : defaultValue;
  } catch {
    return undefined;
  }
};

export const setStorageData = (key: string, value?: unknown) => {
  try {
    if (value !== undefined) {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
};

export const removeDataFromStorage = (key: string) => setStorageData(key);
