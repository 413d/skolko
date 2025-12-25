import { AlertCircle } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/ui';

export const RatesError = (props: {
  errorMessage?: string;
  hasData?: boolean;
}) => {
  if (!props.errorMessage) return null;
  return (
    <Alert variant={props.hasData ? 'default' : 'destructive'} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{props.hasData ? 'Rates may be outdated' : 'Unable to load rates'}</AlertTitle>
      <AlertDescription>
        {props.errorMessage}
      </AlertDescription>
    </Alert>
  );
};
