import { dateToCommonString } from '@/shared/lib/date';

export const RatesFetchDate = (props: { date?: Date }) => {
  if (!props.date) return null;

  return (
    <p className="mb-2 text-xs text-muted-foreground text-right select-none cursor-none">
      {dateToCommonString(props.date)}
    </p>
  );
};
