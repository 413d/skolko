import { useUnit } from 'effector-react';

import { tempLinesApplied, tempLinesProvided, tempLinesCleared, $tempMode } from '../model/converter';

export const useTempCurrencies = () => useUnit({
  provideTempCurrencies: tempLinesProvided,
  applyTempCurrencies: tempLinesApplied,
  clearTempCurrencies: tempLinesCleared,
  isTempCurrencyMode: $tempMode,
} as const);
