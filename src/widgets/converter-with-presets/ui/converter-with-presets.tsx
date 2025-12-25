import { type FC } from 'react';

import { CurrenciesConverter, useConverterActions } from '@/features/currency-convert';
import { PresetManager, usePreset } from '@/features/preset-management';

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
    </div>
  );
};
