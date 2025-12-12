export const checkClipboardSupport = () => {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  if (!checkClipboardSupport()) {
    throw new Error('Clipboard API is not supported.');
  }
  await navigator.clipboard.writeText(text);
};
