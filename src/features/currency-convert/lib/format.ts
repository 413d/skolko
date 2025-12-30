const DEFAULT_LOCALE = 'fr-FR';

const getUserLocale = () =>
  typeof navigator !== 'undefined' ? navigator.language : DEFAULT_LOCALE;

export const createNumberFormatter = () => {
  const formatter = new Intl.NumberFormat(getUserLocale(), {
    maximumFractionDigits: 4,
    useGrouping: true,
  });

  return {
    format: (num: number) => (num === 0 ? '' : formatter.format(num)),
    parse: (value: string) => {
      try {
        if (!value.trim()) return 0;

        let cleaned = value.replace(/[^\d.,]/g, '');

        const lastDot = cleaned.lastIndexOf('.');
        const lastComma = cleaned.lastIndexOf(',');
        const lastSeparatorIndex = Math.max(lastDot, lastComma);

        if (lastSeparatorIndex !== -1) {
          const integerPart = cleaned.slice(0, lastSeparatorIndex).replace(/[.,]/g, '');
          const fractionalPart = cleaned.slice(lastSeparatorIndex + 1);
          cleaned = `${integerPart}.${fractionalPart}`;
        }

        const num = parseFloat(cleaned);

        return Number.isFinite(num) ? num : 0;
      } catch {
        return 0;
      }
    },
  };
};
