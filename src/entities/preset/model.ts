export type PresetId = string;

export type Preset = {
  id: PresetId;
  name: string;
};

export const createPresetId = (): PresetId => String(Date.now());
