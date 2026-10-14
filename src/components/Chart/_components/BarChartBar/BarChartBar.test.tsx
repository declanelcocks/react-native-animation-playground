import { fireEvent, render, screen } from '@testing-library/react-native';
import { Rect } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { BarChartBar } from '.';
import { ChartPoint } from '../../utils/buildCharts';
import { ChartThemeContext, DEFAULT_CHART_THEME } from '../../utils/theme';

type TestNode = ReturnType<typeof screen.UNSAFE_getByType>;

const animated = (node: TestNode) =>
  (node.props as { animatedProps: Record<string, unknown> }).animatedProps;

const point = (index: number, value = 10): ChartPoint => ({
  formattedValue: `${value}`,
  index,
  value,
});

const renderBar = (
  props: Partial<React.ComponentProps<typeof BarChartBar>> = {},
) =>
  render(
    <BarChartBar
      activePoint={createSharedValue<ChartPoint | null>(null)}
      barWidth={10}
      baselineY={100}
      calculateYValue={(value) => 100 - value}
      chartHeight={100}
      data={point(2)}
      leftOffset={5}
      step={20}
      {...props}
    />,
  );

// The first rect is the transparent hit area, the second is the visible bar.
const getBar = () => screen.UNSAFE_getAllByType(Rect)[1];

describe('BarChartBar', () => {
  it('renders a transparent hit area and a bar', () => {
    renderBar();

    const [hitArea, bar] = screen.UNSAFE_getAllByType(Rect);

    expect(hitArea.props.fill).toBe('transparent');
    expect(hitArea.props.width).toBe(20);
    expect(hitArea.props.height).toBe(100);
    expect(bar.props.width).toBe(10);
  });

  it('sizes the bar from the value to the baseline', () => {
    renderBar({ calculateYValue: () => 70 });

    expect(getBar().props.height).toBe(30);
  });

  it('draws bars below the baseline for negative values', () => {
    renderBar({ baselineY: 50, calculateYValue: () => 80 });

    const bar = getBar();

    expect(bar.props.height).toBe(30);
    expect(bar.props.transform).toEqual([
      { translateY: DEFAULT_CHART_THEME.layout.yMargin + 50 },
      { translateX: 2 * 20 + 20 / 2 - 10 / 2 + 5 },
    ]);
  });

  it('keeps a minimum bar height of 2', () => {
    renderBar({ calculateYValue: () => 100 });

    expect(getBar().props.height).toBe(2);
  });

  it('uses the bar colour when it is not the active point', () => {
    renderBar({
      activePoint: createSharedValue<ChartPoint | null>(point(1)),
    });

    expect(animated(getBar()).fill).toBe(DEFAULT_CHART_THEME.colors.bar);
  });

  it('uses the bar colour when there is no active point', () => {
    renderBar();

    expect(animated(getBar()).fill).toBe(DEFAULT_CHART_THEME.colors.bar);
  });

  it('uses the active colour when it is the active point', () => {
    renderBar({
      activePoint: createSharedValue<ChartPoint | null>(point(2)),
    });

    expect(animated(getBar()).fill).toBe(DEFAULT_CHART_THEME.colors.barActive);
  });

  it('uses colours from a custom theme', () => {
    render(
      <ChartThemeContext.Provider
        value={{
          ...DEFAULT_CHART_THEME,
          colors: {
            ...DEFAULT_CHART_THEME.colors,
            bar: '#111111',
            barActive: '#222222',
          },
        }}
      >
        <BarChartBar
          activePoint={createSharedValue<ChartPoint | null>(point(2))}
          barWidth={10}
          baselineY={100}
          calculateYValue={() => 50}
          chartHeight={100}
          data={point(2)}
          leftOffset={0}
          step={20}
        />
      </ChartThemeContext.Provider>,
    );

    expect(animated(getBar()).fill).toBe('#222222');
  });

  it('calls onPress when the bar or its hit area is pressed', () => {
    const onPress = jest.fn();
    renderBar({ onPress });

    const [hitArea, bar] = screen.UNSAFE_getAllByType(Rect);

    fireEvent.press(hitArea);
    fireEvent.press(bar);

    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
