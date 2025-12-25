import { useEffect, useMemo, useState } from 'react';
import { useUnit } from 'effector-react';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useCopy } from '../lib/copy';

import {
  lineDeleted,
  lineReordered,
  currencyChanged,
  amountChanged,
  converterUpdated,
  $lines,
  $usedCurrencies,
} from '../model/converter';

import { CurrencyLine, CurrencyLineDragOverlay, CurrencyLineSkeleton } from './currency-line';

type Props = {
  rates: Record<string, number> | undefined;
  isRatesLoading: boolean;
  converterId?: string;
}

export const CurrencyLines = ({ rates, isRatesLoading, converterId }: Props) => {
  const [
    onDeleteLine,
    onLineReordered,
    onCurrencyChange,
    onAmountChange,
    updateConverter,
    lines,
    usedCurrencies,
  ] = useUnit([
    lineDeleted,
    lineReordered,
    currencyChanged,
    amountChanged,
    converterUpdated,
    $lines,
    $usedCurrencies,
  ] as const);

  useEffect(() => {
    updateConverter({ rates, converterId });
  }, [updateConverter, rates, converterId]);

  const currencies = useMemo(() => rates ? Object.keys(rates) : [], [rates]);

  const { canCopy, copy } = useCopy();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [currencyToDrag, setCurrencyToDrag] = useState<string>();

  const handleDragStart = (event: DragStartEvent) => {
    setCurrencyToDrag(event.active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setCurrencyToDrag(undefined);

    if (over && active.id !== over.id) {
      const oldIndex = lines?.findIndex((l) => l.currency === active.id);
      const newIndex = lines?.findIndex((l) => l.currency === over.id);

      if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== -1 && newIndex !== -1) {
        onLineReordered({ from: oldIndex, to: newIndex });
      }
    }
  };

  if ((isRatesLoading && rates === undefined) || lines === undefined) {
    return <CurrencyLinesSkeleton
      lineCount={Math.max(2, lines?.length ?? 0)}
      canCopy={canCopy}
    />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={lines.map(l => l.currency)}
        strategy={verticalListSortingStrategy}
      >
        {lines.map((v) => rates?.[v.currency] !== undefined && (
          <CurrencyLine
            className="mb-4"
            key={v.currency}
            currencies={currencies}
            amount={v.amount}
            currency={v.currency}
            onAmountChange={(newAmount) => onAmountChange({
              line: v,
              newAmount,
              rates,
            })}
            onCurrencyChange={(newCurrency) => {
              if (usedCurrencies.has(newCurrency)) {
                toast.error(`Already added: ${newCurrency}.`);
                return;
              }
              onCurrencyChange({
                line: v,
                newCurrency,
                rates,
              });
            }}
            onDelete={() => !isRatesLoading && onDeleteLine(v)}
            onCopy={canCopy ? (() => copy(`${String(v.amount)} ${v.currency}`)) : undefined}
          />
        ))}
      </SortableContext>
      <DragOverlay>
        {currencyToDrag && (
          <CurrencyLineDragOverlay
            currency={currencyToDrag}
            canCopy={canCopy}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

type SkeletonProps = {
  lineCount?: number;
  canCopy?: boolean;
}
function CurrencyLinesSkeleton({
  lineCount = 2,
  canCopy = true,
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: lineCount }).map((_, index) => (
        <CurrencyLineSkeleton
          key={index}
          className="mb-4"
          canCopy={canCopy}
        />
      ))}
    </>
  );
};
