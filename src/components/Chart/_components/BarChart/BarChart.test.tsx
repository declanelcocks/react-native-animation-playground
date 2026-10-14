import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Line } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { BarChart } from '.';
import { buildCharts, BuiltChart, ChartPoint } from '../../utils/buildCharts';
import { ChartThemeContext, DEFAULT_CHART_THEME } from '../../utils/theme';
import { BarChartBar } from '../BarChartBar';

const { colors, layout } = DEFAULT_CHART_THEME;
const size = { height: 100, width: 232 };

const build = (
  values: number[],
  options: { includeZero?: boolean } = {},
  labelsPosition?: 'left' | 'right',
): BuiltChart[] =>
  buildCharts(
    size,
    {
      dataSets: [{ data: values.map((value) => ({ value })), label: 'set' }],
      type: 'bar',
      ...options,
    },
    { formatValue: String, labelsPosition, yAxisWidth: layout.yAxisWidth },
  ).mainCharts;

const renderBarChart = (
  charts: BuiltChart[],
  props: Partial<React.ComponentProps<typeof BarChart>> = {},
) =>
  render(
    <BarChart
      activePoint={createSharedValue<ChartPoint | null>(null)}
      chart={charts[0]}
      charts={charts}
      currentChartIndex={createSharedValue(0)}
      height={size.height}
      width={size.width}
      {...props}
    />,
  );

const getBars = () => screen.UNSAFE_getAllByType(BarChartBar);
const getBaseline = () => {
  const lines = screen.UNSAFE_getAllByType(Line);

  return lines[lines.length - 1];
};

describe('BarChart', () => {
  it('renders one bar per point of the chart', () => {
    renderBarChart(build([1, 2, 3, 4]));

    expect(
      getBars().map(({ props }) => (props as { data: ChartPoint }).data.index),
    ).toEqual([0, 1, 2, 3]);
  });

  it('renders the bars of the current chart only', () => {
    const charts = [...build([1, 2]), ...build([1, 2, 3])];

    renderBarChart(charts, { chart: charts[1] });

    expect(getBars()).toHaveLength(3);
  });

  it('splits the plot width between the bars', () => {
    renderBarChart(build([1, 2, 3, 4]));

    const { barWidth, step } = getBars()[0].props;

    expect(step).toBe((size.width - layout.yAxisWidth) / 4);
    expect(barWidth).toBe(
      Math.min(step - layout.barMargin * 2, layout.maxBarWidth),
    );
  });

  it('caps the bar width at the theme max', () => {
    renderBarChart(build([1]));

    expect(getBars()[0].props.barWidth).toBe(layout.maxBarWidth);
  });

  it('draws the baseline at the chart baseline', () => {
    const charts = build([1, 2, 3]);
    renderBarChart(charts);

    const { props } = getBaseline();

    expect(props.y1).toBe(charts[0].baselineY);
    expect(props.y2).toBe(charts[0].baselineY);
    expect(props.x1).toBe(layout.yAxisWidth);
    expect(props.x2).toBe(size.width);
  });

  it('puts the baseline at the bottom without includeZero', () => {
    renderBarChart(build([10, 20]));

    expect(getBaseline().props.y1).toBe(size.height);
  });

  it('puts the baseline at zero with includeZero', () => {
    const charts = build([-10, 10], { includeZero: true });
    renderBarChart(charts);

    expect(getBaseline().props.y1).toBe(charts[0].scaleY(0));
    expect(getBaseline().props.y1).toBeLessThan(size.height);
  });

  it('passes the active point and the bar position to each bar', () => {
    const activePoint = createSharedValue<ChartPoint | null>(null);
    renderBarChart(build([1, 2]), { activePoint });

    expect(getBars()[0].props.activePoint).toBe(activePoint);
    expect(getBars()[0].props.leftOffset).toBe(layout.yAxisWidth);
  });

  describe('labelsPosition', () => {
    it('starts the bars at the left edge when the labels are on the right', () => {
      renderBarChart(build([1, 2], {}, 'right'), { labelsPosition: 'right' });

      const { props } = getBaseline();

      expect(getBars()[0].props.leftOffset).toBe(0);
      expect(props.x1).toBe(0);
      expect(props.x2).toBe(size.width - layout.yAxisWidth);
    });
  });

  it('uses the baseline colour from a custom theme', () => {
    const charts = build([1, 2]);

    render(
      <ChartThemeContext.Provider
        value={{
          ...DEFAULT_CHART_THEME,
          colors: { ...colors, axisLine: '#abcdef' },
        }}
      >
        <BarChart
          activePoint={createSharedValue<ChartPoint | null>(null)}
          chart={charts[0]}
          charts={charts}
          currentChartIndex={createSharedValue(0)}
          height={size.height}
          width={size.width}
        />
      </ChartThemeContext.Provider>,
    );

    expect(getBaseline().props.stroke).toBe('#abcdef');
  });

  it('renders no bars for an empty data set', () => {
    const charts = build([]);
    renderBarChart(charts);

    expect(screen.UNSAFE_queryAllByType(BarChartBar)).toHaveLength(0);
    expect(getBaseline().props.y1).toBe(0);
  });

  it('renders its children', () => {
    renderBarChart(build([1, 2]), { children: <Text>child</Text> });

    expect(screen.getByText('child')).toBeOnTheScreen();
  });
});
