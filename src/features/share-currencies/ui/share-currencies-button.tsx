import type { FC } from 'react';
import { Share } from 'lucide-react';
import { toast } from 'sonner';

import { appConfig } from '@/shared/config';
import { checkClipboardSupport, copyToClipboard } from '@/shared/lib/clipboard';
import { Button } from '@/shared/ui';

import { createURLWithSharedCurrencies } from '../model';
import type { SharedCurrency } from '../types';

type Props = {
  currencies: SharedCurrency[];
  size?: 'icon' | 'default' | 'lg';
  className?: string;
};

export const ShareCurrenciesButton: FC<Props> = ({ currencies, size = 'icon', className }) => {
  if (currencies.length === 0) return null;

  const handleShare = async () => {
    try {
      const url = createURLWithSharedCurrencies(currencies);

      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({
          title: `Currencies to convert in ${appConfig.title}`,
          url,
        });
      } else if (checkClipboardSupport()) {
        await copyToClipboard(url);
        toast.info('Share link copied.', {
          description: url,
          duration: 3000,
          dismissible: true,
        });
      } else {
        toast.error('Sharing is not supported on this device.');
      }
    } catch (error) {
      console.error('Error sharing currencies:', error);
      toast.error('Could not share currencies.');
    }
  };

  return (
    <Button
      variant={size === 'icon' ? 'outline' : 'secondary'}
      size={size}
      aria-label="Share currencies"
      title="Share currencies"
      className={className}
      onClick={() => void handleShare()}
    >
      <Share />
      {size !== 'icon' && <span>Share {size === 'lg' && 'currencies'}</span>}
    </Button>
  );
};
