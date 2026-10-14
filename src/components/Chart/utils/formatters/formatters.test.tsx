import { defaultFormatValue, formatNumber, noValueConstant } from '.';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('returns the no-value constant for null and undefined', () => {
      expect(formatNumber(undefined)).toBe(noValueConstant);
      expect(formatNumber(null as unknown as undefined)).toBe(noValueConstant);
    });

    it('pads to the minimum fraction digits by default', () => {
      expect(formatNumber(5)).toBe('5.00');
    });

    it('rounds to the maximum fraction digits', () => {
      expect(formatNumber(1.2349, '1.0-3')).toBe('1.235');
    });

    it('pads to the minimum integer digits', () => {
      expect(formatNumber(5, '2.0-0')).toBe('05');
    });

    it('parses numeric strings', () => {
      expect(formatNumber('7.5')).toBe('7.50');
    });

    it('returns the invalid value message for Number.NaN when one is given', () => {
      expect(formatNumber('abc', '1.2-2', { invalidValueMessage: 'n/a' })).toBe(
        'n/a',
      );
    });

    it('formats Number.NaN when no invalid value message is given', () => {
      expect(formatNumber('abc')).toBe(
        new Intl.NumberFormat().format(Number.NaN),
      );
    });
  });

  describe('defaultFormatValue', () => {
    it('formats to two decimals', () => {
      expect(defaultFormatValue(3)).toBe('3.00');
      expect(defaultFormatValue(3.1415)).toBe('3.14');
    });
  });
});
