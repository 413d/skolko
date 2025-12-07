import { useEffect, type FC } from 'react';
import { useUnit } from 'effector-react';

import {
  $rates,
  $isRatesLoading,
  $ratesError,
  $ratesFetchedAt,
  ratesInited,
} from '../model/rates';

import { RatesError } from './rates-error';
import { RatesFetchDate } from './rates-fetch-date';
import { CurrencyLineAdd } from './currency-line-add';
import { CurrencyLines } from './currency-lines';



export const CurrenciesConverter: FC<{ className?: string }> = ({ className }) => {
  const [
    rates,
    isRatesLoading,
    ratesError,
    ratesFetchedAt,
    initRates,
  ] = useUnit([
    $rates,
    $isRatesLoading,
    $ratesError,
    $ratesFetchedAt,
    ratesInited,
  ] as const);
  useEffect(() => {
    initRates();
  }, [initRates]);

  return (
    <div className={className}>
      <RatesError hasData={rates !== undefined} errorMessage={ratesError} />
      <RatesFetchDate date={ratesFetchedAt} />
      <CurrencyLines rates={rates} isRatesLoading={isRatesLoading} />
      {rates !== undefined && (
        <CurrencyLineAdd
          className="w-full"
          rates={rates}
          isRatesLoading={isRatesLoading}
        />
      )}
    </div>
  );
};
