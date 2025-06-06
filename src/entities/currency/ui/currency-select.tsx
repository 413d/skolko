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

const PLACEHOLDER = 'Select a currency';

export const CurrencySelect = ({ currencies, currency, onSelectCurrency }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="min-w-26 justify-between"
      >
        {currency ?? PLACEHOLDER}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="min-w-26 p-0" align="end">
      <Command>
        <CommandInput placeholder={PLACEHOLDER} className="h-9" />
        <CommandList>
          <CommandEmpty>No currency found</CommandEmpty>
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
