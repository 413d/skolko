import { createEffect, createEvent, createStore, sample } from 'effector';
import { debounce, previous } from 'patronum';

import { getStorageData, setStorageData } from '@/shared/lib/storage';

import { createPresetId, type Preset, type PresetId } from '@/entities/preset';

const PRESETS_STORAGE_KEY = 'presets';
const ACTIVE_PRESET_STORAGE_KEY = 'active-preset-id';

const isValidPreset = (data: unknown): data is Preset => (
  typeof data === 'object' &&
  data !== null &&
  'id' in data &&
  'name' in data &&
  typeof data.id === 'string' &&
  typeof data.name === 'string'
);

const getPresetsFromStorage = (): Preset[] => {
  const data = getStorageData(PRESETS_STORAGE_KEY);
  if (!Array.isArray(data)) return [];
  return data.filter(isValidPreset);
};

const getActivePresetIdFromStorage = (): PresetId | undefined => {
  const data = getStorageData<PresetId>(ACTIVE_PRESET_STORAGE_KEY);
  if (typeof data !== 'string') return undefined;
  return data;
};

const savePresetsInStorageFx = createEffect((presets: Preset[]) => {
  setStorageData(PRESETS_STORAGE_KEY, presets);
});

const saveActivePresetIdInStorageFx = createEffect((presetId: PresetId | undefined) => {
  setStorageData(ACTIVE_PRESET_STORAGE_KEY, presetId);
});

const presetCreated = createEvent<Pick<Preset, 'name'>>();
const presetRenamed = createEvent<Preset>();
const presetDeleted = createEvent<PresetId>();
const presetSelected = createEvent<PresetId | undefined>();

const $presets = createStore<Preset[]>(getPresetsFromStorage())
  .on(presetCreated, (presets, { name }) => presets.concat({
    id: createPresetId(),
    name,
  }))
  .on(presetRenamed, (presets, { id, name }) =>
    presets.map((p) => (p.id === id ? { ...p, name } : p)),
  )
  .on(presetDeleted, (presets, id) => presets.filter((p) => p.id !== id));

const $activePresetId = createStore<PresetId | undefined>(getActivePresetIdFromStorage(), { skipVoid: false })
  .on(presetSelected, (_, id) => id);

const presetsChangedDebounced = debounce($presets, 500);
sample({
  clock: presetsChangedDebounced,
  target: savePresetsInStorageFx,
});

const activePresetIdChangedDebounced = debounce($activePresetId, 500);
sample({
  clock: activePresetIdChangedDebounced,
  target: saveActivePresetIdInStorageFx,
});

const $previousPresets = previous($presets);
sample({
  clock: $presets.updates,
  source: {
    previousPresets: $previousPresets,
    nextPresets: $presets,
    currentPresetId: $activePresetId,
  },
  filter: ({ previousPresets }) => Boolean(previousPresets),
  fn: ({ nextPresets, previousPresets, currentPresetId }) => {
    if (!previousPresets) return currentPresetId;
    if (nextPresets.length === 0) return undefined;

    // select on created preset
    if (nextPresets.length > previousPresets.length) {
      return nextPresets[nextPresets.length - 1].id;
    }

    // validate current preset id on deleted preset
    return nextPresets.find(preset => preset.id === currentPresetId)?.id;
  },
  target: $activePresetId,
});

export {
  $presets,
  $activePresetId,
  presetCreated,
  presetRenamed,
  presetDeleted,
  presetSelected,
};
