import { fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { Line, Rect } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { ScrollableBarChart } from '.';
import { buildCharts, BuiltChart, ChartPoint } from '../../utils/buildCharts';
import { DEFAULT_CHART_THEME } from '../../utils/theme';
import { BarChartBar } from '../BarChartBar';

const { layout } = DEFAULT_CHART_THEME;
const size = { height: 100, width: 232 };

const build = (values: number[]): BuiltChart[] =>
  buildCharts(
    size,
    {
      dataSets: [{ data: values.map((value) => ({ value })), label: 'set' }],
      type: 'bar',
    },
    { formatValue: String, yAxisWidth: layout.yAxisWidth },
  ).mainCharts;

const getProps = (
  charts: BuiltChart[],
  activePoint = createSharedValue<ChartPoint | null>(null),
) => ({
  activePoint,
  chart: charts[0],
  charts,
  currentChartIndex: createSharedValue(0),
  height: size.height,
  width: size.width,
});

const getBars = () => screen.UNSAFE_getAllByType(BarChartBar);
const scrollToEnd = jest.fn();

describe('ScrollableBarChart', () => {
  beforeEach(() => {
    scrollToEnd.mockClear();
    jest
      .spyOn(ScrollView.prototype, 'scrollToEnd')
      .mockImplementation(scrollToEnd);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders one bar per point', () => {
    render(<ScrollableBarChart {...getProps(build([1, 2, 3, 4, 5]))} />);

    expect(
      getBars().map(({ props }) => (props as { data: ChartPoint }).data.index),
    ).toEqual([0, 1, 2, 3, 4]);
  });

  it('uses the default bar width and gap', () => {
    render(<ScrollableBarChart {...getProps(build([1, 2]))} />);

    expect(getBars()[0].props.barWidth).toBe(32);
    expect(getBars()[0].props.step).toBe(40);
  });

  it('uses a custom bar width and gap', () => {
    render(
      <ScrollableBarChart
        {...getProps(build([1, 2]))}
        barGap={4}
        barWidth={10}
      />,
    );

    expect(getBars()[0].props.barWidth).toBe(10);
    expect(getBars()[0].props.step).toBe(14);
  });

  it('scrolls to the end on mount', () => {
    render(<ScrollableBarChart {...getProps(build([1, 2, 3]))} />);

    expect(scrollToEnd).toHaveBeenCalledTimes(1);
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: false });
  });

  it('scrolls to the end again when the chart changes', () => {
    const first = build([1, 2, 3]);
    const second = build([4, 5, 6, 7]);
    const { rerender } = render(<ScrollableBarChart {...getProps(first)} />);

    rerender(
      <ScrollableBarChart
        {...getProps([...first, ...second])}
        chart={second[0]}
      />,
    );

    expect(scrollToEnd).toHaveBeenCalledTimes(2);
    expect(getBars()).toHaveLength(4);
  });

  it('does not scroll again when the chart is unchanged', () => {
    const props = getProps(build([1, 2, 3]));
    const { rerender } = render(<ScrollableBarChart {...props} />);

    rerender(<ScrollableBarChart {...props} />);

    expect(scrollToEnd).toHaveBeenCalledTimes(1);
  });

  it('sets the active point when a bar is tapped', () => {
    const activePoint = createSharedValue<ChartPoint | null>(null);
    const charts = build([1, 2, 3]);
    render(<ScrollableBarChart {...getProps(charts, activePoint)} />);

    // Each bar renders a hit area followed by the visible bar.
    const rects = screen.UNSAFE_getAllByType(Rect);
    fireEvent.press(rects[3]);

    expect(activePoint.get()).toEqual({ ...charts[0].data[1], index: 1 });
  });

  it('draws the baseline across the chart width', () => {
    const charts = build([1, 2]);
    render(<ScrollableBarChart {...getProps(charts)} />);

    const lines = screen.UNSAFE_getAllByType(Line);
    const { props } = lines[lines.length - 1];

    expect(props.y1).toBe(charts[0].baselineY);
    expect(props.x1).toBe(layout.yAxisWidth);
    expect(props.x2).toBe(size.width);
  });

  describe('labelsPosition', () => {
    it('insets the bars on the right when the labels are on the left', () => {
      render(<ScrollableBarChart {...getProps(build([1, 2]))} />);

      expect(screen.UNSAFE_getByType(ScrollView).parent?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ left: layout.yAxisWidth, right: 0 }),
        ]),
      );
    });

    it('insets the bars on the left when the labels are on the right', () => {
      const charts = build([1, 2]);
      render(
        <ScrollableBarChart {...getProps(charts)} labelsPosition="right" />,
      );

      const lines = screen.UNSAFE_getAllByType(Line);
      const { props } = lines[lines.length - 1];

      expect(props.x1).toBe(0);
      expect(props.x2).toBe(size.width - layout.yAxisWidth);
    });
  });

  it('renders no bars for an empty data set', () => {
    render(<ScrollableBarChart {...getProps(build([]))} />);

    expect(screen.UNSAFE_queryAllByType(BarChartBar)).toHaveLength(0);
  });
});
