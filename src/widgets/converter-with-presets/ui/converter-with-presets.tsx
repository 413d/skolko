import { useEffect, type FC } from 'react';

import { CurrenciesConverter, useConverterActions, useCurrentCurrencies, useTempCurrencies } from '@/features/currency-convert';
import { PresetManager, usePreset } from '@/features/preset-management';
import { ShareCurrenciesButton, useSharedCurrencies } from '@/features/share-currencies';

type ConverterWithPresetsProps = {
  className?: string;
};

export const ConverterWithPresets: FC<ConverterWithPresetsProps> = ({ className }) => {
  const { onDelete: onConverterDeleted } = useConverterActions();
  const {
    provideTempCurrencies,
    applyTempCurrencies,
    clearTempCurrencies,
    isTempCurrencyMode,
  } = useTempCurrencies();

  const [sharedCurrencies, clearSharedCurrencies] = useSharedCurrencies();
  useEffect(() => {
    if (sharedCurrencies.length > 0) {
      provideTempCurrencies(sharedCurrencies.map(({ code, amount }) => ({ currency: code, amount: amount ?? 0 })));
      clearSharedCurrencies();
    }
  }, [sharedCurrencies, provideTempCurrencies, clearSharedCurrencies]);

  const [preset, setPreset] = usePreset();

  const onCreatePreset = (presetId: string) => {
    if (isTempCurrencyMode) {
      applyTempCurrencies({ converterId: presetId });
    }
    setPreset(presetId);
  };

  const onSelectPreset = (presetId?: string) => {
    if (isTempCurrencyMode) {
      clearTempCurrencies({ converterId: presetId });
    }
    setPreset(presetId);
  };

  const onDeletePreset = (presetId: string) => {
    onConverterDeleted({ converterId: presetId });
  };

  return (
    <div className={className}>
      <PresetManager
        activePresetId={isTempCurrencyMode ? undefined : preset}
        onCreatePreset={onCreatePreset}
        onSelectPreset={onSelectPreset}
        onDeletePreset={onDeletePreset}
        formForced={isTempCurrencyMode}
        className="mb-4 w-full"
      />
      <CurrenciesConverter className="w-full mt-4" id={preset} />
      {!isTempCurrencyMode && <Share className="mt-4 w-full" />}
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
