import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { createSharedValue } from '@/tests/sharedValue';

import { CandlestickChart } from '.';
import { buildCharts, BuiltChart, ChartPoint } from '../../utils/buildCharts';
import { DEFAULT_CHART_THEME } from '../../utils/theme';
import { CandlestickChartCandle } from '../CandlestickChartCandle';

const { layout } = DEFAULT_CHART_THEME;
const size = { height: 100, width: 232 };

const build = (count: number, label = 'set'): BuiltChart[] =>
  buildCharts(
    size,
    {
      dataSets: [
        {
          data: Array.from({ length: count }, (_, i) => ({
            close: 12 + i,
            high: 20 + i,
            low: 5,
            open: 10 + i,
          })),
          label,
        },
      ],
      type: 'candlestick',
    },
    { formatValue: String, yAxisWidth: layout.yAxisWidth },
  ).mainCharts;

const renderChart = (
  charts: BuiltChart[],
  props: Partial<React.ComponentProps<typeof CandlestickChart>> = {},
) =>
  render(
    <CandlestickChart
      activePoint={createSharedValue<ChartPoint | null>(null)}
      chart={charts[0]}
      charts={charts}
      currentChartIndex={createSharedValue(0)}
      height={size.height}
      width={size.width}
      {...props}
    />,
  );

const getCandles = () => screen.UNSAFE_getAllByType(CandlestickChartCandle);

describe('CandlestickChart', () => {
  it('renders one candle per point of the chart', () => {
    renderChart(build(4));

    expect(
      getCandles().map(
        ({ props }) => (props as { data: ChartPoint }).data.index,
      ),
    ).toEqual([0, 1, 2, 3]);
    expect(getCandles()[1].props.data).toMatchObject({
      close: 13,
      high: 21,
      low: 5,
      open: 11,
    });
  });

  it('renders the candles of the current chart only', () => {
    const charts = [...build(2), ...build(5)];

    renderChart(charts, { chart: charts[1] });

    expect(getCandles()).toHaveLength(5);
  });

  it('splits the plot width between the candles', () => {
    renderChart(build(4));

    const { candleWidth, step } = getCandles()[0].props;

    expect(step).toBe((size.width - layout.yAxisWidth) / 4);
    expect(candleWidth).toBe(
      Math.min(step - layout.barMargin * 2, layout.maxBarWidth),
    );
  });

  it('wires the chart scales to each candle', () => {
    const charts = build(2);
    renderChart(charts);

    const { calculateYValue } = getCandles()[0].props;

    expect(calculateYValue(10)).toBe(charts[0].scaleY(10));
  });

  describe('labelsPosition', () => {
    it('offsets the candles by the y-axis width on the left', () => {
      renderChart(build(2));

      expect(getCandles()[0].props.leftOffset).toBe(layout.yAxisWidth);
    });

    it('starts the candles at the left edge when the labels are on the right', () => {
      renderChart(build(2), { labelsPosition: 'right' });

      expect(getCandles()[0].props.leftOffset).toBe(0);
    });
  });

  it('renders no candles for an empty data set', () => {
    renderChart(build(0));

    expect(screen.UNSAFE_queryAllByType(CandlestickChartCandle)).toHaveLength(
      0,
    );
  });

  it('renders its children', () => {
    renderChart(build(2), { children: <Text>child</Text> });

    expect(screen.getByText('child')).toBeOnTheScreen();
  });
});
