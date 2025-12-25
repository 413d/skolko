import { type FC } from 'react';
import { useUnit } from 'effector-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

import { $presets } from '../model/presets';

export const PresetSelect: FC<{
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  className?: string;
}> = ({ activePresetId, onSelectPreset, className }) => {
  const presets = useUnit($presets);

  return (
    <Select value={activePresetId} onValueChange={onSelectPreset}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select preset" />
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        <SelectGroup>
          <SelectLabel>Presets</SelectLabel>
          {presets.length > 0 ? presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
          )) : (
            <SelectItem value="0" disabled>
              No presets yet
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
