const noValueConstant = '-';
export const hiddenValueConstant = '***';

const isNumber = (num?: number | string) => {
  'worklet';
  return typeof num === 'number' || (typeof num === 'string' && !!num);
};

export const round = (
  value?: null | number | string,
  precision = 0,
  removeInsignificantZeros?: boolean,
): string => {
  'worklet';

  if (value == null || !isNumber(value) || Number.isNaN(Number(value))) {
    return noValueConstant;
  }

  const p = Math.pow(10, precision);
  let result: number | string = (Math.round(Number(value) * p) / p).toFixed(
    precision,
  );

  if (removeInsignificantZeros) {
    result = Number(result);
  }

  return result.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const pct = (value?: null | number | string): any => {
  'worklet';
  return value != null && !Number.isNaN(Number(value))
    ? `${round(Number(value) * 100, 2)}%`
    : noValueConstant;
};

/**
 * Formats a currency
 * @param digits {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 */
export const formatNumber = (
  value?: number | string,
  digits = '1.2-2',
  options?: { hidden?: boolean; invalidValueMessage?: string },
) => {
  if (value == null) {
    return noValueConstant;
  }

  // using parseFloat instead of Number() as Number("") returns 0, instead we want NaN
  const num = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(num) && options?.invalidValueMessage)
    return options.invalidValueMessage;

  if (options?.hidden) {
    return hiddenValueConstant;
  }

  const splitDigits = digits.split('.');
  const splitFractions = splitDigits[1].split('-');
  const minimumIntegerDigits = Number(splitDigits[0]);
  const minimumFractionDigits = Number(splitFractions[0]);
  const maximumFractionDigits = Number(splitFractions[1]);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits,
    minimumIntegerDigits,
  }).format(num);
};

/**
 * Formats a price with 2 digits for USD or 3 for HKD
 * Optionally prepends the currency
 */
export const formatPrice = (
  value?: null | number,
  _currencySymbol?: null | string,
  currency?: null | string,
  showDashForZero?: boolean,
) => {
  if (value == null) {
    return noValueConstant;
  }

  if (showDashForZero && value === 0) {
    return noValueConstant;
  }

  const number = formatNumber(value, '1.2-2');

  return number === noValueConstant
    ? number
    : currency
      ? `${currency} ${number}`
      : number;
};
