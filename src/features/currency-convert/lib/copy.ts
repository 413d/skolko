import { toast } from 'sonner';

import { checkClipboardSupport, copyToClipboard } from '@/shared/lib/clipboard';

export const useCopy = () => {
  const canCopy = checkClipboardSupport();

  const copy = (textToCopy: string) => {
    if (!canCopy) {
      toast.error('Clipboard not available.');
      return;
    }

    copyToClipboard(textToCopy)
      .then(() => {
        toast.info(`Copied: ${textToCopy}`);
      })
      .catch((error: unknown) => {
        console.error('Failed to copy:', error);
        toast.error('Could not copy.');
      });
  };

  return { canCopy, copy } as const;
};
