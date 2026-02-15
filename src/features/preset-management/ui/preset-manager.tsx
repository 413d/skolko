import { useState, type FC } from 'react';
import { useUnit } from 'effector-react';
import { CirclePlus, Pencil, Trash2 } from 'lucide-react';

import { Button, cn } from '@/shared/ui';

import { createPresetFx, presetDeleted, presetRenamed } from '../model/presets';

import { PresetSelect } from './preset-select';
import { PresetForm } from './preset-form';

type Props = {
  activePresetId: string | undefined;
  onSelectPreset: (id: string | undefined) => void;
  onDeletePreset?: (id: string) => void;
  onCreatePreset?: (id: string) => void;
  formForced?: boolean;
  className?: string;
};

export const PresetManager: FC<Props> = ({
  activePresetId,
  onSelectPreset,
  onDeletePreset,
  onCreatePreset,
  formForced,
  className,
}) => {
  const [createPreset, renamePreset, deletePreset] = useUnit([
    createPresetFx,
    presetRenamed,
    presetDeleted,
  ] as const);

  const [formType, setFormType] = useState<'create' | 'update'>();

  if (formType !== undefined || formForced) {
    const type = formForced
      ? (activePresetId ? 'update' : 'create')
      : formType;
    return (
      <PresetForm
        key={activePresetId ?? 'new'}
        id={type === 'update' ? activePresetId : undefined}
        className={className}
        onClose={formForced ? (() => onSelectPreset(activePresetId)) : (() => setFormType(undefined))}
        onSubmit={(name) => {
          if (type === 'update') {
            if (!activePresetId) return;
            renamePreset({ id: activePresetId, name });
          } else {
            void createPreset(name).then((preset) => {
              onCreatePreset?.(preset.id);
            });
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
        aria-label="New preset"
        className="cursor-pointer"
        onClick={() => setFormType('create')}
      >
        <CirclePlus />
      </Button>

      <PresetSelect
        className="flex-1"
        activePresetId={activePresetId ?? ''}
        onSelectPreset={onSelectPreset}
      />

      {activePresetId && (<>
        <Button
          size="icon"
          variant="outline"
          aria-label="Rename preset"
          className="cursor-pointer"
          onClick={() => setFormType('update')}
        >
          <Pencil />
        </Button>

        <Button
          size="icon"
          variant="outline"
          aria-label="Delete preset"
          className="cursor-pointer"
          onClick={() => {
            deletePreset(activePresetId);
            onDeletePreset?.(activePresetId);
          }}
        >
          <Trash2 />
        </Button>
      </>)}
    </div>
  );
};
