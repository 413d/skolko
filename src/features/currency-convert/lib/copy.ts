import { toast } from 'sonner';

import { checkClipboardSupport, copyToClipboard } from '@/shared/lib/clipboard';

export const useCopy = () => {
  const canCopy = checkClipboardSupport();

  const copy = (textToCopy: string) => {
    if (!canCopy) {
      toast.error('📋 Clipboard not supported');
      return;
    }

    copyToClipboard(textToCopy)
      .then(() => {
        toast.info(`📋 Copied: ${textToCopy}`);
      })
      .catch((error: unknown) => {
        console.error('Failed to copy:', error);
        toast.error('📋 Failed to copy');
      });
  };

  return { canCopy, copy } as const;
};
