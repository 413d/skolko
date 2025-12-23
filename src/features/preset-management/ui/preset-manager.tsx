import { useState, type FC } from 'react';
import { useUnit } from 'effector-react';
import { CirclePlus, Pencil, Trash2 } from 'lucide-react';

import { Button, cn } from '@/shared/ui';

import { presetCreated, presetDeleted, presetRenamed } from '../model/presets';

import { PresetSelect } from './preset-select';
import { PresetForm } from './preset-form';

type Props = {
  activePresetId: string | undefined;
  onSelectPreset: (id: string) => void;
  className?: string;
};

export const PresetManager: FC<Props> = ({ activePresetId, onSelectPreset, className }) => {
  const [createPreset, renamePreset] = useUnit([
    presetCreated,
    presetRenamed,
    presetDeleted,
  ] as const);

  const [formType, setFormType] = useState<'create' | 'update'>();

  if (formType !== undefined) {
    return (
      <PresetForm
        key={activePresetId ?? 'new'}
        id={formType === 'update' ? activePresetId : undefined}
        className={className}
        onClose={() => setFormType(undefined)}
        onSubmit={(name) => {
          if (formType === 'update') {
            if (!activePresetId) return;
            renamePreset({ id: activePresetId, name });
          } else {
            createPreset({ name });
          }
          setFormType(undefined);
        }}
      />
    );
  }

  return (
    <div className={cn(className, 'flex justify-between gap-2')}>
      <Button
        size="icon"
        variant="default"
        aria-label="Add a preset"
        className="cursor-pointer"
        onClick={() => setFormType('create')}
      >
        <CirclePlus />
      </Button>

      <PresetSelect
        className="flex-1"
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
      />

      {activePresetId && (<>
        <Button
          size="icon"
          variant="outline"
          aria-label="Rename the preset"
          className="cursor-pointer"
          onClick={() => setFormType('update')}
        >
          <Pencil />
        </Button>

        <Button
          size="icon"
          variant="outline"
          aria-label="Delete the preset"
          className="cursor-pointer"
          onClick={() => presetDeleted(activePresetId)}
        >
          <Trash2 />
        </Button>
      </>)}
    </div>
  );
};
