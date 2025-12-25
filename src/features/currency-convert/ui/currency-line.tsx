import { memo } from 'react';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

import { cn, Button } from '@/shared/ui';

import { CurrencySelect, type CurrencyCode } from '@/entities/currency';

import { AmountInput, AmountInputSkeleton } from './amount-input';

type Props = {
  className?: string;
  currencies: CurrencyCode[];
  amount: number;
  currency: CurrencyCode;
  onAmountChange: (newAmount: number) => void;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  onDelete: () => void;
  onCopy?: () => void;
}

const CurrencyLineContent = memo<Omit<Props, 'className'> & {
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
}>(({
  currencies,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  onDelete,
  onCopy,
  dragAttributes,
  dragListeners,
}) => (
  <>
    <Button
      variant="ghost"
      size="icon"
      className="cursor-grab touch-none shrink-0"
      aria-label="Reorder row"
      title="Reorder"
      {...dragAttributes}
      {...dragListeners}
    >
      <GripVertical className="h-4 w-4" />
    </Button>

    <AmountInput
      className="grow"
      value={amount}
      onChange={onAmountChange}
    />

    <CurrencySelect
      currencies={currencies}
      currency={currency}
      onSelectCurrency={onCurrencyChange}
      aria-label="Select currency"
    />

    {onCopy !== undefined && (
      <Button
        className="cursor-pointer"
        variant="outline"
        size="icon"
        title="Copy"
        aria-label="Copy"
        onClick={onCopy}
      >
        <Copy />
      </Button>
    )}

    <Button
      className="cursor-pointer"
      variant="destructive"
      size="icon"
      title="Remove"
      aria-label="Remove row"
      onClick={onDelete}
    >
      <Trash2 />
    </Button>
  </>
), (prevProps, nextProps) => (
  prevProps.currencies.length === nextProps.currencies.length &&
  prevProps.amount === nextProps.amount &&
  prevProps.currency === nextProps.currency
));
CurrencyLineContent.displayName = 'CurrencyLineContent';

export const CurrencyLine = ({
  className,
  currency,
  ...props
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: currency });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? 'relative' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex space-x-2', className, isDragging && 'opacity-50')}
    >
      <CurrencyLineContent
        {...props}
        currency={currency}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
};

export const CurrencyLineSkeleton = ({ className, canCopy }: { className?: string; canCopy?: boolean }) => (
  <div
    className={cn('flex space-x-2 select-none cursor-wait', className)}
    role="status"
    aria-busy="true"
    aria-label="Loading row"
  >
    <div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse shrink-0" aria-hidden="true" />
    <AmountInputSkeleton />
    <div className="h-9 w-20 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />
    {canCopy && (<div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />)}
    <div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />
  </div>
);

export const CurrencyLineDragOverlay = (props: { currency: CurrencyCode; canCopy?: boolean }) => (
  <div className="flex space-x-2 bg-background rounded-lg shadow-lg border p-1 opacity-90">
    <Button
      variant="ghost"
      size="icon"
      className="cursor-grabbing shrink-0"
    >
      <GripVertical className="h-4 w-4" />
    </Button>

    <div className="flex items-center h-9 grow px-3 border rounded-md bg-background text-sm tabular-nums">
      <div className="h-full w-full bg-primary/10 rounded animate-pulse" />
    </div>

    <div className="flex items-center justify-center h-9 w-20 border rounded-md bg-background text-sm font-medium">
      {props.currency}
    </div>

    {props.canCopy && (
      <Button variant="outline" size="icon" disabled>
        <Copy />
      </Button>
    )}

    <Button variant="destructive" size="icon" disabled>
      <Trash2 />
    </Button>
  </div>
);
