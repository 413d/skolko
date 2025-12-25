import { useUnit } from 'effector-react';

import { converterDeleted } from '../model/converter';

export const useConverterActions = () => {
  const onDelete = useUnit(converterDeleted);

  return { onDelete } as const;
};
