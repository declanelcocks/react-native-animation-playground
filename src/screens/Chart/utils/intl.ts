const noValueConstant = '-';
export const hiddenValueConstant = '***';

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
  const number_ = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(number_) && options?.invalidValueMessage)
    return options.invalidValueMessage;

  if (options?.hidden) return hiddenValueConstant;

  const splitDigits = digits.split('.');
  const splitFractions = splitDigits[1].split('-');
  const minimumIntegerDigits = Number(splitDigits[0]);
  const minimumFractionDigits = Number(splitFractions[0]);
  const maximumFractionDigits = Number(splitFractions[1]);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits,
    minimumIntegerDigits,
  }).format(number_);
};
