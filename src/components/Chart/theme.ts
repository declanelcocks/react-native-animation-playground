import { createContext, useContext } from 'react';

export interface ChartTheme {
  animation: {
    /** Duration of the transition between data sets, in ms. */
    transitionDuration: number;
  };
  colors: {
    axisLine: string;
    bar: string;
    barActive: string;
    buttonActive: string;
    buttonInactive: string;
    buttonTextActive: string;
    buttonTextInactive: string;
    crosshair: string;
    gridLine: string;
    negative: string;
    negativeActive: string;
    positive: string;
    positiveActive: string;
  };
  layout: {
    axisLabelFontSize: number;
    /** Gap between neighbouring bars or candles, on each side. */
    barMargin: number;
    cursorSize: number;
    /** Widest a bar or candle gets. */
    maxBarWidth: number;
    /** Extra width after the plot, so the cursor isn't clipped. */
    xMargin: number;
    /** Width of the y-axis label column. */
    yAxisWidth: number;
    /** Extra height above and below the plot, so the cursor isn't clipped. */
    yMargin: number;
  };
}

export interface ChartThemeOverride {
  animation?: Partial<ChartTheme['animation']>;
  colors?: Partial<ChartTheme['colors']>;
  layout?: Partial<ChartTheme['layout']>;
}

export const DEFAULT_CHART_THEME: ChartTheme = {
  animation: {
    transitionDuration: 150,
  },
  colors: {
    axisLine: '#4D4D4D',
    bar: '#2196F3',
    barActive: '#1565C0',
    buttonActive: '#44427D',
    buttonInactive: '#A1A1A1',
    buttonTextActive: '#FFFFFF',
    buttonTextInactive: '#4D4D4D',
    crosshair: '#303030',
    gridLine: '#4D4D4D',
    negative: '#C13333',
    negativeActive: '#8B1A1A',
    positive: '#4CAF50',
    positiveActive: '#2E7D32',
  },
  layout: {
    axisLabelFontSize: 9,
    barMargin: 1,
    cursorSize: 12,
    maxBarWidth: 30,
    xMargin: 32,
    yAxisWidth: 32,
    yMargin: 4,
  },
};

/** Fills in whatever `override` leaves out with the default theme. */
export const mergeChartTheme = (override?: ChartThemeOverride): ChartTheme => ({
  animation: { ...DEFAULT_CHART_THEME.animation, ...override?.animation },
  colors: { ...DEFAULT_CHART_THEME.colors, ...override?.colors },
  layout: { ...DEFAULT_CHART_THEME.layout, ...override?.layout },
});

export const ChartThemeContext = createContext<ChartTheme>(DEFAULT_CHART_THEME);

export const useChartTheme = () => useContext(ChartThemeContext);
