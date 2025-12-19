import { type FC } from 'react';

import { CurrenciesConverter } from '@/features/currency-convert';
import { PresetManager, usePreset } from '@/features/preset-management';

type ConverterWithPresetsProps = {
  className?: string;
};

export const ConverterWithPresets: FC<ConverterWithPresetsProps> = ({ className }) => {
  const [preset, setPreset] = usePreset();

  return (
    <div className={className}>
      <PresetManager
        activePresetId={preset}
        onSelectPreset={setPreset}
        className="mb-4 w-full"
      />
      <CurrenciesConverter className="w-full mt-4" id={preset} />
    </div>
  );
};
