import { render, screen } from '@testing-library/react-native';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { createSharedValue } from '@/tests/sharedValue';

import { LineChartCursor } from '.';
import {
  ChartTheme,
  ChartThemeContext,
  DEFAULT_CHART_THEME,
  mergeChartTheme,
} from '../../utils/theme';

const flatten = (style: unknown) =>
  (StyleSheet.flatten(style as StyleProp<ViewStyle>) as
    | Record<string, unknown>
    | undefined) ?? {};

const { cursorSize } = DEFAULT_CHART_THEME.layout;

const renderCursor = ({
  isActive = true,
  theme = DEFAULT_CHART_THEME,
  trend = 'positive',
}: {
  isActive?: boolean;
  theme?: ChartTheme;
  trend?: 'negative' | 'positive';
} = {}) => {
  render(
    <ChartThemeContext.Provider value={theme}>
      <LineChartCursor
        currentTrend={createSharedValue(trend)}
        height={100}
        isCursorActive={createSharedValue(isActive)}
        translation={{ x: createSharedValue(30), y: createSharedValue(40) }}
        width={200}
      />
    </ChartThemeContext.Provider>,
  );

  // The mock renders `Animated.View` as a plain `View`, so the absolute fill
  // wrappers around the indicator lines match too; skip them.
  const [dot, , vertical, , horizontal] = screen
    .UNSAFE_getAllByType(Animated.View)
    .map((view) => flatten(view.props.style));

  return { dot, horizontal, vertical };
};

describe('LineChartCursor', () => {
  it('centres the dot on the translation', () => {
    const { dot } = renderCursor();

    expect(dot).toMatchObject({
      height: cursorSize,
      opacity: 1,
      transform: [
        { translateX: 30 - cursorSize / 2 },
        { translateY: 40 - cursorSize / 2 },
      ],
      width: cursorSize,
    });
  });

  it('shows the indicator lines at the translation while active', () => {
    const { horizontal, vertical } = renderCursor();

    expect(vertical).toMatchObject({
      height: 100,
      opacity: 1,
      transform: [{ translateX: 30 }],
      width: 1,
    });
    expect(horizontal).toMatchObject({
      height: 1,
      opacity: 1,
      transform: [{ translateY: 40 }],
      width: 200,
    });
  });

  it('hides the indicator lines while inactive', () => {
    const { horizontal, vertical } = renderCursor({ isActive: false });

    expect(vertical).toMatchObject({
      opacity: 0,
      transform: [{ translateX: 0 }],
    });
    expect(horizontal).toMatchObject({
      opacity: 0,
      transform: [{ translateY: 0 }],
    });
  });

  it('uses the positive colour for a positive trend', () => {
    const { dot, horizontal, vertical } = renderCursor();

    for (const style of [dot, horizontal, vertical]) {
      expect(style.backgroundColor).toBe(DEFAULT_CHART_THEME.colors.positive);
    }
  });

  it('uses the negative colour for a negative trend', () => {
    const { dot, horizontal, vertical } = renderCursor({ trend: 'negative' });

    for (const style of [dot, horizontal, vertical]) {
      expect(style.backgroundColor).toBe(DEFAULT_CHART_THEME.colors.negative);
    }
  });

  it('takes its colours and size from a custom theme', () => {
    const { dot } = renderCursor({
      theme: mergeChartTheme({
        colors: { positive: '#00FF00' },
        layout: { cursorSize: 20 },
      }),
    });

    expect(dot).toMatchObject({
      backgroundColor: '#00FF00',
      height: 20,
      transform: [{ translateX: 20 }, { translateY: 30 }],
    });
  });
});
