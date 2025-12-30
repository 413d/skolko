import { useUnit } from 'effector-react';

import { $lines } from '../model/converter';

export const useCurrentCurrencies = () => useUnit($lines);
