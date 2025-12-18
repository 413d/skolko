import { useState, type FC } from 'react';

import { PresetSelect } from './preset-select';
import { PresetForm } from './preset-form';

type Props = {
  activePresetId: string | undefined;
  onSelectPreset: (id: string) => void;
  className?: string;
};

export const PresetManager: FC<Props> = ({ activePresetId, onSelectPreset, className }) => {
  const [formInitialState, setFormInitialState] = useState<string>();

  if (!activePresetId || formInitialState !== undefined) {
    return (
      <PresetForm
        className={className}
        initialName={formInitialState}
        onCreated={(preset) => {
          setFormInitialState(undefined);
          onSelectPreset(preset.id);
        }} 
        onClose={activePresetId ? () => setFormInitialState(undefined) : undefined}
      />
    );
  }

  return (
    <div className={className}>
      <PresetSelect
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
        onOpenPresetForm={setFormInitialState}
      />
    </div>
  );
};
