import { render, screen } from '@testing-library/react-native';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Line } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { CrosshairCursor } from '.';
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

const renderCursor = (
  isActive: boolean,
  theme: ChartTheme = DEFAULT_CHART_THEME,
) => {
  render(
    <ChartThemeContext.Provider value={theme}>
      <CrosshairCursor
        height={100}
        isCursorActive={createSharedValue(isActive)}
        translation={{ x: createSharedValue(30), y: createSharedValue(40) }}
        width={200}
      />
    </ChartThemeContext.Provider>,
  );

  const [horizontal, vertical] = screen
    .UNSAFE_getAllByType(Animated.View)
    .map((view) => flatten(view.props.style));

  return { horizontal, vertical };
};

describe('CrosshairCursor', () => {
  it('is hidden while the cursor is inactive', () => {
    const { horizontal, vertical } = renderCursor(false);

    expect(horizontal.opacity).toBe(0);
    expect(vertical.opacity).toBe(0);
    expect(horizontal.transform).toBeUndefined();
    expect(vertical.transform).toBeUndefined();
  });

  it('follows the translation while the cursor is active', () => {
    const { horizontal, vertical } = renderCursor(true);

    expect(horizontal).toMatchObject({
      opacity: 1,
      transform: [{ translateY: 40 }],
    });
    expect(vertical).toMatchObject({
      opacity: 1,
      transform: [{ translateX: 30 }],
    });
  });

  it('draws a full width horizontal and a full height vertical line', () => {
    renderCursor(true);

    const [horizontal, vertical] = screen.UNSAFE_getAllByType(Line);

    expect(horizontal.props).toMatchObject({ x1: 0, x2: 200, y1: 0, y2: 0 });
    expect(vertical.props).toMatchObject({ x1: 0, x2: 0, y1: 0, y2: 100 });
  });

  it('uses the theme crosshair colour', () => {
    renderCursor(true, mergeChartTheme({ colors: { crosshair: '#ABCDEF' } }));

    for (const line of screen.UNSAFE_getAllByType(Line)) {
      expect(line.props.stroke).toBe('#ABCDEF');
    }
  });
});
