import { dateToCommonString } from '@/shared/lib/date';

export const RatesFetchDate = (props: {
  date?: Date;
  isLoading?: boolean;
}) => (
  <p className="mb-2 text-xs text-muted-foreground text-right select-none cursor-default">
    {props.isLoading ? (
      <span className="inline-block h-3 w-24 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />
    ) : (
      props.date && dateToCommonString(props.date)
    )}
  </p>
);
