import { useState, useRef, useEffect, type FC } from 'react';
import { useUnit } from 'effector-react';
import { toast } from 'sonner';
import { CircleX, Save } from 'lucide-react';

import { Input, Button, cn } from '@/shared/ui';

import type { Preset } from '@/entities/preset';

import { $presets, presetCreated } from '../model/presets';
import { clearName } from '../lib/name';

export const PresetForm: FC<{
  initialName?: string,
  className?: string,
  onCreated?: (preset: Preset) => void,
  onClose?: () => void,
}> = ({ initialName, className, onCreated, onClose }) => {
  const [presets, onCreate] = useUnit([
    $presets,
    presetCreated,
  ] as const);

  const [name, setName] = useState(initialName ?? '');

  const unsubscribeFromPresetCreation = useRef<(() => void) | null>(null);
  const presetCreationTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribeAll = () => {
    unsubscribeFromPresetCreation.current?.();
    if (presetCreationTimeoutId.current) clearTimeout(presetCreationTimeoutId.current);
  };
  useEffect(() => unsubscribeAll, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validName = clearName(name);

    if (!validName) {
      toast.error('Preset name cannot be empty or contain only special characters.');
      return;
    }

    if (presets.some(preset => preset.name === validName)) {
      toast.error('A preset with this name already exists.');
      return;
    }

    unsubscribeAll();

    presetCreationTimeoutId.current = setTimeout(() => {
      unsubscribeFromPresetCreation.current?.();
      unsubscribeFromPresetCreation.current = null;
      toast.error('Failed to create preset. Please try again.');
    }, 5000);

    unsubscribeFromPresetCreation.current = $presets.updates.watch((presets) => {
      const created = presets.find(p => p.name === validName);
      if (created) {
        if (presetCreationTimeoutId.current) clearTimeout(presetCreationTimeoutId.current);
        unsubscribeFromPresetCreation.current?.();
        unsubscribeFromPresetCreation.current = null;
        toast.success('Preset saved successfully.', { description: created.name });

        setName('');
        onCreated?.(created);
      }
    });

    onCreate({ name: validName });
  };

  return (
    <form className={cn('flex items-center gap-2', className)} onSubmit={handleSubmit}>
      <Input placeholder="Preset name" value={name} onChange={e => setName(e.target.value)} />
      <Button type="submit" size="icon" variant="outline" aria-label="Save preset" className="cursor-pointer">
        <Save />
      </Button>
      {typeof onClose === 'function' && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Close preset form"
          onClick={onClose}
          className="cursor-pointer"
        >
          <CircleX />
        </Button>
      )}
    </form>
  );
};
