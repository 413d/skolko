import { type FC, useState } from 'react';
import { useCommandState } from 'cmdk';
import { useUnit } from 'effector-react';
import { Check, ChevronsUpDown, Plus, Save } from 'lucide-react';

import {
  cn,
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui';

import { $presets } from '../model/presets';
import { clearName } from '../lib/name';

const CreatePresetItem: FC<{ onCreate: (name: string) => void }> = ({ onCreate }) => {
  const search = useCommandState((state) => state.search);
  const isEmpty = useCommandState((state) => state.filtered.count === 0);

  if (!isEmpty || !search.trim()) return null;

  return (
    <CommandItem
      value={clearName(search)}
      forceMount
      onSelect={onCreate}
    >
      <Plus className="mr-2 h-4 w-4" />
      Create preset &ldquo;{search}&rdquo;
    </CommandItem>
  );
};

export const PresetSelect: FC<{
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  onOpenPresetForm: (name: string) => void;
}> = ({ activePresetId, onSelectPreset, onOpenPresetForm }) => {
  const presets = useUnit($presets);
  const [open, setOpen] = useState(false);

  const presetName = presets.find(p => p.id === activePresetId)?.name;

  if (!presetName) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between cursor-pointer"
        onClick={() => onOpenPresetForm('')}
      >
        Save as preset
        <Save className="ml-2 h-4 w-4 shrink-0" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full flex justify-between gap-2">
          <Button
            variant="outline"
            role="combobox"
            className="justify-between flex-1"
          >
            {presetName}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          <Button variant="outline" size="icon" onClick={(e) => {
            e.stopPropagation();
            onOpenPresetForm('');
          }}>
            <Plus />
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0" matchTriggerWidth>
        <Command>
          <CommandInput placeholder="Search or create a preset..." className="h-9" />

          <CommandList>
            <CreatePresetItem onCreate={onOpenPresetForm} />
            <CommandGroup>
              {presets.map((preset) => (
                <CommandItem
                  key={preset.id}
                  value={preset.id}
                  onSelect={(id) => {
                    onSelectPreset(id);
                    setOpen(false);
                  }}
                >
                  {preset.name}
                  <Check
                    className={cn(
                      'ml-auto',
                      preset.id === activePresetId ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
