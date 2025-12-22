import { type FC } from 'react';
import { useList } from 'effector-react';

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
  activePresetId: string | undefined;
  onSelectPreset: (id: string) => void;
  className?: string;
}> = ({ activePresetId, onSelectPreset, className }) => {
  const list = useList($presets, (preset) => (
    <SelectItem value={preset.id}>{preset.name}</SelectItem>
  ));

  return (
    <Select value={activePresetId} onValueChange={onSelectPreset}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a preset" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Presets</SelectLabel>
          {list}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
