import { render, screen } from '@testing-library/react-native';
import { Line, Rect } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { CandlestickChartCandle } from '.';
import { ChartPoint } from '../../utils/buildCharts';
import { ChartThemeContext, DEFAULT_CHART_THEME } from '../../utils/theme';

type TestNode = ReturnType<typeof screen.UNSAFE_getByType>;

const animated = (node: TestNode) =>
  (node.props as { animatedProps: Record<string, unknown> }).animatedProps;

const { colors, layout } = DEFAULT_CHART_THEME;

const candle = (
  open: number,
  close: number,
  index = 1,
  extra: Partial<ChartPoint> = {},
): ChartPoint => ({
  close,
  formattedValue: `${close}`,
  high: 90,
  index,
  low: 10,
  open,
  value: close,
  ...extra,
});

const renderCandle = (
  data: ChartPoint,
  activeIndex: null | number = null,
  theme = DEFAULT_CHART_THEME,
) =>
  render(
    <ChartThemeContext.Provider value={theme}>
      <CandlestickChartCandle
        activePoint={createSharedValue<ChartPoint | null>(
          activeIndex === null ? null : candle(0, 0, activeIndex),
        )}
        calculateCandleHeight={(size) => size * 2}
        calculateYValue={(value) => 100 - value}
        candleWidth={8}
        data={data}
        leftOffset={4}
        step={20}
      />
    </ChartThemeContext.Provider>,
  );

const getWick = () => screen.UNSAFE_getByType(Line);
const getBody = () => screen.UNSAFE_getByType(Rect);

describe('CandlestickChartCandle', () => {
  describe('colour', () => {
    it('is positive when it closes above the open', () => {
      renderCandle(candle(20, 30));

      expect(animated(getWick()).stroke).toBe(colors.positive);
      expect(animated(getBody()).fill).toBe(colors.positive);
    });

    it('is positive when it closes at the open', () => {
      renderCandle(candle(20, 20));

      expect(animated(getBody()).fill).toBe(colors.positive);
    });

    it('is negative when it closes below the open', () => {
      renderCandle(candle(30, 20));

      expect(animated(getWick()).stroke).toBe(colors.negative);
      expect(animated(getBody()).fill).toBe(colors.negative);
    });

    it('uses the active colours when it is the active point', () => {
      renderCandle(candle(20, 30, 1), 1);

      expect(animated(getWick()).stroke).toBe(colors.positiveActive);
      expect(animated(getBody()).fill).toBe(colors.positiveActive);
    });

    it('uses the negative active colour for a down candle', () => {
      renderCandle(candle(30, 20, 1), 1);

      expect(animated(getBody()).fill).toBe(colors.negativeActive);
    });

    it('stays inactive when another candle is active', () => {
      renderCandle(candle(30, 20, 1), 2);

      expect(animated(getBody()).fill).toBe(colors.negative);
    });

    it('uses colours from a custom theme', () => {
      renderCandle(candle(20, 30), null, {
        ...DEFAULT_CHART_THEME,
        colors: { ...colors, positive: '#00ff00' },
      });

      expect(animated(getBody()).fill).toBe('#00ff00');
    });
  });

  describe('geometry', () => {
    it('draws the wick from the low to the high at the step centre', () => {
      renderCandle(candle(20, 30, 2));

      const { props } = getWick();

      expect(props.x1).toBe(2 * 20 + 10);
      expect(props.x2).toBe(2 * 20 + 10);
      expect(props.y1).toBe(100 - 10);
      expect(props.y2).toBe(100 - 90);
      expect(props.strokeWidth).toBe(2);
    });

    it('draws the body from the open/close range, centred on the step', () => {
      renderCandle(candle(20, 30, 2));

      const { props } = getBody();

      expect(props.width).toBe(8);
      expect(props.height).toBe(20);
      expect(props.transform).toEqual([
        { translateY: layout.yMargin + 70 },
        { translateX: 2 * 20 + 10 - 4 + 4 },
      ]);
    });

    it('starts the body at the higher of the open and close', () => {
      renderCandle(candle(30, 20));

      expect(
        (getBody().props as { transform: unknown[] }).transform[0],
      ).toEqual({
        translateY: layout.yMargin + 70,
      });
    });

    it('keeps a minimum body height of 2 for a doji', () => {
      renderCandle(candle(20, 20));

      expect(getBody().props.height).toBe(2);
    });
  });
});
