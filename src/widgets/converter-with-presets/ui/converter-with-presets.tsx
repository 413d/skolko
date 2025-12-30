import { type FC } from 'react';

import { CurrenciesConverter, useConverterActions, useCurrentCurrencies } from '@/features/currency-convert';
import { PresetManager, usePreset } from '@/features/preset-management';
import { ShareCurrenciesButton } from '@/features/share-currencies';

type ConverterWithPresetsProps = {
  className?: string;
};

export const ConverterWithPresets: FC<ConverterWithPresetsProps> = ({ className }) => {
  const [preset, setPreset] = usePreset();

  const { onDelete: onConverterDeleted } = useConverterActions();
  const onDeletePreset = (presetId: string) => {
    onConverterDeleted({ converterId: presetId });
  };

  return (
    <div className={className}>
      <PresetManager
        activePresetId={preset}
        onSelectPreset={setPreset}
        onDeletePreset={onDeletePreset}
        className="mb-4 w-full"
      />
      <CurrenciesConverter className="w-full mt-4" id={preset} />
      <Share className="mt-4 w-full" />
    </div>
  );
};

function Share({ className }: { className?: string }) {
  const rawCurrencies = useCurrentCurrencies();

  const currencies = rawCurrencies?.map(({ currency, amount }, idx) => {
    if (idx === 0) return { code: currency, amount };
    return { code: currency };
  }) ?? [];
  
  return (
    <ShareCurrenciesButton
      currencies={currencies}
      size="lg"
      className={className}
    />
  );
}
