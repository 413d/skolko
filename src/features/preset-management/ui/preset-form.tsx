import { useState, type FC } from 'react';
import { useUnit } from 'effector-react';
import { toast } from 'sonner';
import { CircleX, Save } from 'lucide-react';

import { Input, Button, cn } from '@/shared/ui';

import { $presets, presetCreated } from '../model/presets';
import { clearName } from '../lib/name';

export const PresetForm: FC<{
  initialName?: string,
  className?: string,
  onClose?: () => void,
}> = ({ initialName, className, onClose }) => {
  const [presets, onCreate] = useUnit([
    $presets,
    presetCreated,
  ] as const);

  const [name, setName] = useState(initialName ?? '');

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
