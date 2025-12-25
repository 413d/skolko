import { useState, type FC } from 'react';
import { toast } from 'sonner';
import { CircleX, Save } from 'lucide-react';

import { Input, Button, cn } from '@/shared/ui';

import { $presets } from '../model/presets';
import { clearName } from '../lib/name';
import { useUnit } from 'effector-react';

export const PresetForm: FC<{
  id?: string,
  className?: string,
  onClose?: () => void,
  onSubmit: (name: string) => void,
}> = ({ id, className, onClose, onSubmit }) => {
  const presets = useUnit($presets);

  const presetName = id && presets.find(p => p.id === id)?.name;
  const [name, setName] = useState(presetName ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validName = clearName(name);

    if (!validName) {
      toast.error('Enter a preset name.');
      return;
    }

    if (presets.some(preset => preset.name === validName)) {
      toast.error('Name already in use.');
      return;
    }

    onSubmit(validName);
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
          aria-label="Cancel"
          onClick={onClose}
          className="cursor-pointer"
        >
          <CircleX />
        </Button>
      )}
    </form>
  );
};
