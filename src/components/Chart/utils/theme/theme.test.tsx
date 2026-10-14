import { renderHook } from '@testing-library/react-native';
import { ReactNode } from 'react';

import {
  ChartThemeContext,
  DEFAULT_CHART_THEME,
  mergeChartTheme,
  useChartTheme,
} from '.';

describe('theme', () => {
  describe('mergeChartTheme', () => {
    it('returns the default theme when there is no override', () => {
      expect(mergeChartTheme()).toEqual(DEFAULT_CHART_THEME);
    });

    it('overrides only the keys that are given', () => {
      const theme = mergeChartTheme({
        animation: { transitionDuration: 500 },
        colors: { bar: '#000000' },
        layout: { maxBarWidth: 10 },
      });

      expect(theme.animation.transitionDuration).toBe(500);
      expect(theme.colors.bar).toBe('#000000');
      expect(theme.colors.barActive).toBe(DEFAULT_CHART_THEME.colors.barActive);
      expect(theme.layout.maxBarWidth).toBe(10);
      expect(theme.layout.yAxisWidth).toBe(
        DEFAULT_CHART_THEME.layout.yAxisWidth,
      );
    });

    it('does not mutate the default theme', () => {
      mergeChartTheme({ colors: { bar: '#000000' } });

      expect(DEFAULT_CHART_THEME.colors.bar).toBe('#2196F3');
    });
  });

  describe('useChartTheme', () => {
    it('returns the default theme without a provider', () => {
      const { result } = renderHook(() => useChartTheme());

      expect(result.current).toBe(DEFAULT_CHART_THEME);
    });

    it('returns the theme from the context provider', () => {
      const custom = mergeChartTheme({ colors: { positive: '#00FF00' } });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ChartThemeContext.Provider value={custom}>
          {children}
        </ChartThemeContext.Provider>
      );

      const { result } = renderHook(() => useChartTheme(), { wrapper });

      expect(result.current.colors.positive).toBe('#00FF00');
    });
  });
});
