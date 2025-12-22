import { useEffect, useState, type FC } from 'react';

import { Button, cn } from '@/shared/ui';

import { PresetSelect } from './preset-select';
import { PresetForm } from './preset-form';
import { CirclePlus } from 'lucide-react';

type Props = {
  activePresetId: string | undefined;
  onSelectPreset: (id: string) => void;
  className?: string;
};

export const PresetManager: FC<Props> = ({ activePresetId, onSelectPreset, className }) => {
  const [formInitialState, setFormInitialState] = useState<string>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormInitialState(undefined);
  }, [activePresetId]);

  if (formInitialState !== undefined || !activePresetId) {
    return (
      <PresetForm
        className={className}
        initialName={formInitialState}
        onClose={() => setFormInitialState(undefined)}
      />
    );
  }

  return (
    <div className={cn(className, 'flex justify-between gap-2')}>
      <PresetSelect
        className="flex-1"
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
      />
      
      <Button
        size="icon"
        variant="outline"
        aria-label="Add a preset"
        className="cursor-pointer"
        onClick={() => setFormInitialState('')}
      >
        <CirclePlus />
      </Button>
    </div>
  );
};
