import { useUnit } from 'effector-react';
import { $activePresetId, presetSelected } from '../model/presets';

export const usePreset = () => useUnit([$activePresetId, presetSelected] as const);
