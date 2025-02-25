export const roundTo = (value: number, precision = 2) =>
  Math.round(value * 10 ** precision) / 10 ** precision;

export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
