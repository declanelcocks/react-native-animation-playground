import type {
  CandlestickDataPoint,
  ChartData,
  ChartType,
  DataPoint,
  DataSet,
  FormatValue,
} from '.';

// The types module has no runtime behaviour. These assignments are checked by
// `tsc`, so the test fails to compile if the ChartData union stops accepting
// the shapes the chart relies on.
const formatValue: FormatValue = (value) => `${value}`;

describe('types', () => {
  it('accepts the data shape of every chart type', () => {
    const points: DataSet<DataPoint> = {
      data: [{ label: 'a', value: 1 }, { value: 2 }],
      label: 'set',
    };
    const candles: DataSet<CandlestickDataPoint> = {
      data: [{ close: 2, high: 3, low: 0, open: 1 }],
      label: 'set',
    };

    const charts: ChartData[] = [
      { dataSets: [points], type: 'line' },
      { dataSets: [points], includeZero: true, type: 'bar' },
      { dataSets: [points], type: 'bar-scrollable' },
      { dataSets: [candles], type: 'candlestick' },
    ];
    const types: ChartType[] = charts.map(({ type }) => type);

    expect(types).toEqual(['line', 'bar', 'bar-scrollable', 'candlestick']);
    expect(formatValue(1)).toBe('1');
  });
});
