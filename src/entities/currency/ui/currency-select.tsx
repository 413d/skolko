import { Check, ChevronsUpDown } from 'lucide-react';

import {
  cn,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui';

import type { CurrencyCode } from '../model';

type Props = {
  currencies: CurrencyCode[];
  currency: CurrencyCode | undefined;
  onSelectCurrency: (currency: CurrencyCode) => void;
};

export const CurrencySelect = ({ currencies, currency, onSelectCurrency }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="justify-between max-w-1/4 w-22"
      >
        {currency ?? 'Select currency'}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="p-0 max-w-xs" align="end">
      <Command>
        <CommandInput placeholder="Search currencies" className="h-9" />
        <CommandList>
          <CommandEmpty>No matching currencies</CommandEmpty>
          <CommandGroup>
            {currencies.map((code) => (
              <CommandItem
                key={code}
                value={code}
                onSelect={onSelectCurrency}
              >
                {code}
                <Check
                  className={cn(
                    'ml-auto',
                    currency === code ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);
