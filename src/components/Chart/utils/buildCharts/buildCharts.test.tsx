import type { ChartData } from '../types';

import { buildCharts } from '.';

// The reanimated mock stubs `interpolate` out, so use a linear clamp.
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<object>('react-native-reanimated/mock'),
  interpolate: (
    value: number,
    [inMin, inMax]: number[],
    [outMin, outMax]: number[],
  ) =>
    outMin +
    (Math.min(Math.max(value, inMin), inMax) - inMin) *
      ((outMax - outMin) / (inMax - inMin)),
}));

const size = { height: 100, width: 232 };
const options = {
  formatValue: (value: number) => `v${value}`,
  yAxisWidth: 32,
};

const lineData = (values: number[], label = 'set'): ChartData => ({
  dataSets: [{ data: values.map((value) => ({ value })), label }],
  type: 'line',
});

describe('buildCharts', () => {
  it('builds one chart per data set, in order', () => {
    const { mainCharts } = buildCharts(
      size,
      {
        dataSets: [
          { data: [{ value: 1 }, { value: 2 }], label: 'first' },
          { data: [{ value: 3 }, { value: 4 }], label: 'second' },
        ],
        type: 'line',
      },
      options,
    );

    expect(mainCharts.map(({ label }) => label)).toEqual(['first', 'second']);
  });

  describe('points', () => {
    it('drops non-finite values and re-indexes the rest', () => {
      const [chart] = buildCharts(
        size,
        lineData([1, Number.NaN, 3, Infinity]),
        options,
      ).mainCharts;

      expect(chart.data.map(({ index, value }) => [index, value])).toEqual([
        [0, 1],
        [1, 3],
      ]);
    });

    it('formats values up front with formatValue', () => {
      const [chart] = buildCharts(size, lineData([1, 2]), options).mainCharts;

      expect(chart.data.map(({ formattedValue }) => formattedValue)).toEqual([
        'v1',
        'v2',
      ]);
    });

    it('uses close as the value for candlestick points', () => {
      const [chart] = buildCharts(
        size,
        {
          dataSets: [
            {
              data: [
                { close: 4, high: 6, low: 0, open: 2 },
                { close: 3, high: 5, low: 1, open: 4 },
              ],
              label: 'candles',
            },
          ],
          type: 'candlestick',
        },
        options,
      ).mainCharts;

      expect(chart.data.map(({ value }) => value)).toEqual([4, 3]);
      expect(chart.data[0]).toMatchObject({ high: 6, low: 0, open: 2 });
    });
  });

  describe('trend', () => {
    it('is positive when the last value is at or above the first', () => {
      expect(
        buildCharts(size, lineData([1, 5, 1]), options).mainCharts[0].trend,
      ).toBe('positive');
    });

    it('is negative when the last value is below the first', () => {
      expect(
        buildCharts(size, lineData([5, 1]), options).mainCharts[0].trend,
      ).toBe('negative');
    });
  });

  describe('y domain', () => {
    it('pads the min/max domain by 10% when zero is not included', () => {
      const [chart] = buildCharts(size, lineData([10, 20]), options).mainCharts;

      expect(chart.scaleY.domain()).toEqual([9, 21]);
      expect(chart.baselineY).toBe(size.height);
    });

    it('starts bars at zero and anchors the baseline there with includeZero', () => {
      const [chart] = buildCharts(
        size,
        {
          dataSets: [{ data: [{ value: 10 }, { value: 20 }], label: 'bars' }],
          includeZero: true,
          type: 'bar',
        },
        options,
      ).mainCharts;

      expect(chart.scaleY.domain()).toEqual([0, 22]);
      expect(chart.baselineY).toBe(chart.scaleY(0));
    });

    it('pads both ends when values cross zero with includeZero', () => {
      const [chart] = buildCharts(
        size,
        {
          dataSets: [{ data: [{ value: -10 }, { value: 10 }], label: 'bars' }],
          includeZero: true,
          type: 'bar',
        },
        options,
      ).mainCharts;

      expect(chart.scaleY.domain()).toEqual([-12, 12]);
    });

    it('uses the high/low range for candlesticks', () => {
      const [chart] = buildCharts(
        size,
        {
          dataSets: [
            {
              data: [
                { close: 4, high: 10, low: 0, open: 2 },
                { close: 3, high: 8, low: 2, open: 4 },
              ],
              label: 'candles',
            },
          ],
          type: 'candlestick',
        },
        options,
      ).mainCharts;

      expect(chart.scaleY.domain()).toEqual([0, 10]);
    });

    it('handles a single flat value without a zero-size domain', () => {
      const [chart] = buildCharts(size, lineData([5]), options).mainCharts;
      const [min, max] = chart.scaleY.domain();

      expect(max).toBeGreaterThan(min);
    });
  });

  describe('y axis labels', () => {
    it('are formatted with formatValue and positioned inside the chart height', () => {
      const [chart] = buildCharts(size, lineData([0, 100]), options).mainCharts;

      expect(chart.yAxisLabels?.length).toBeGreaterThan(0);
      for (const { value, y } of chart.yAxisLabels ?? []) {
        expect(value).toMatch(/^v/);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(size.height);
      }
    });
  });

  describe('getItemAtX', () => {
    it('maps x to the nearest point after the left y-axis offset', () => {
      const [chart] = buildCharts(
        size,
        lineData([1, 2, 3]),
        options,
      ).mainCharts;

      expect(chart.getItemAtX(32).index).toBe(0);
      expect(chart.getItemAtX(size.width).index).toBe(2);
    });

    it('offsets from zero when the labels are on the right', () => {
      const [chart] = buildCharts(size, lineData([1, 2, 3]), {
        ...options,
        labelsPosition: 'right',
      }).mainCharts;

      expect(chart.getItemAtX(0).index).toBe(0);
      expect(chart.getItemAtX(size.width - 32).index).toBe(2);
    });
  });

  describe('scaleBody', () => {
    it('scales a value delta to chart pixels and clamps', () => {
      const [chart] = buildCharts(size, lineData([10, 20]), options).mainCharts;

      expect(chart.scaleBody(0)).toBe(0);
      expect(chart.scaleBody(1000)).toBe(size.height);
    });
  });

  describe('empty data sets', () => {
    it('returns an empty placeholder chart that keeps its label', () => {
      const [chart] = buildCharts(
        size,
        lineData([], 'empty'),
        options,
      ).mainCharts;

      expect(chart).toMatchObject({
        baselineY: 0,
        data: [],
        label: 'empty',
        rawPath: '',
        trend: 'positive',
        yAxisLabels: [],
      });
      expect(chart.scaleBody(5)).toBe(0);
    });

    it('treats a data set of only non-finite values as empty', () => {
      const [chart] = buildCharts(
        size,
        lineData([Number.NaN]),
        options,
      ).mainCharts;

      expect(chart.data).toEqual([]);
    });
  });
});
