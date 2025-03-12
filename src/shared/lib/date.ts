const currentDate = new Date();

export const dateToCommonString = (date: Date): string => date.toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  year: date.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined,
});
