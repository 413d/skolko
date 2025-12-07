import { useUnit } from 'effector-react';
import { Loader2 } from 'lucide-react';

import { Button, cn } from '@/shared/ui';

import { lineAdded } from '../model/converter';

const title = 'Add currency';

type Props = {
  rates: Record<string, number>;
  isRatesLoading: boolean;
  className?: string;
};

export const CurrencyLineAdd = ({
  rates,
  isRatesLoading,
  className,
}: Props) => {
  const onNewLine = useUnit(lineAdded);

  return (
    <Button
      className={cn('cursor-pointer', className)}
      variant="default"
      size="lg"
      disabled={isRatesLoading}
      aria-label={title}
      onClick={() => onNewLine(rates)}
    >
      {
        isRatesLoading ? (<>
          <Loader2 className="animate-spin" />
          <span>The currencies are loading</span>
        </>) : title
      }
    </Button>
  );
};
