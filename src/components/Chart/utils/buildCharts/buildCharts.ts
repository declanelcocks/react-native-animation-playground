import { scaleLinear, ScaleLinear, scaleOrdinal } from 'd3-scale';
import { curveLinear, curveMonotoneX, line } from 'd3-shape';
import { interpolate } from 'react-native-reanimated';
import { parse, Path as RedashPath } from 'react-native-redash';

import { ChartData, ChartType, DataSet, FormatValue } from '../types';

export interface BuiltChart {
  /** The y position bars grow from. */
  baselineY: number;
  data: ChartPoint[];
  getItemAtX(x: number): ChartPoint;
  label: string;
  path: RedashPath;
  rawPath: string;
  scaleBody(v: number): number;
  scaleY: ScaleLinear<number, number>;
  trend: 'negative' | 'positive';
  yAxisLabels?: YAxisLabel[];
}

/**
 * A data point normalised for rendering. `value` drives the line path, bar
 * height and readout; the OHLC fields are only set for candlestick charts.
 */
export interface ChartPoint {
  close?: number;
  /** `value`, formatted with `formatValue` when the chart was built. */
  formattedValue: string;
  high?: number;
  index: number;
  label?: string;
  low?: number;
  open?: number;
  value: number;
}

export interface YAxisLabel {
  value: string;
  y: number;
}

// Formatting happens here, on the JS thread, because the readout reads the
// active point on the UI thread, where `formatValue` couldn't be called.
const toChartPoints = (
  points: Omit<ChartPoint, 'formattedValue' | 'index'>[],
  formatValue: FormatValue,
): ChartPoint[] =>
  points
    .filter((point) => Number.isFinite(point.value))
    .map((point, index) => ({
      ...point,
      formattedValue: formatValue(point.value),
      index,
    }));

const normaliseDataSets = (
  chartData: ChartData,
  formatValue: FormatValue,
): DataSet<ChartPoint>[] => {
  if (chartData.type === 'candlestick') {
    return chartData.dataSets.map(({ data, label }) => ({
      data: toChartPoints(
        data.map((point) => ({ ...point, value: point.close })),
        formatValue,
      ),
      label,
    }));
  }

  return chartData.dataSets.map(({ data, label }) => ({
    data: toChartPoints(data, formatValue),
    label,
  }));
};

const getHighLowDomain = (items: ChartPoint[]): [number, number] => {
  const values = items
    .flatMap(({ high, low }) => [high, low])
    .filter((v): v is number => v !== undefined);
  return [Math.min(...values), Math.max(...values)];
};

// Bars grow from zero, so zero is one end of the domain and only the other end
// is padded. The domain is padded at both ends when the values cross zero.
const getZeroBasedDomain = (
  min: number,
  max: number,
  paddingPct: number,
): [number, number] => {
  const lower = Math.min(0, min);
  const upper = Math.max(0, max);
  const range = upper - lower;

  if (range === 0) return [0, 1];

  const padding = range * paddingPct;
  return [min < 0 ? lower - padding : lower, max > 0 ? upper + padding : upper];
};

const getValueDomain = (
  items: ChartPoint[],
  includeZero: boolean,
  paddingPct = 0.1,
): [number, number] => {
  const values = items.map((d) => d.value).filter((v) => !Number.isNaN(v));
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (includeZero) return getZeroBasedDomain(min, max, paddingPct);

  const range = max - min;
  const padding =
    range > 0 ? range * paddingPct : Math.abs(max) * paddingPct || paddingPct;
  return [min - padding, max + padding];
};

const buildYAxisLabels = (
  min: number,
  max: number,
  height: number,
  formatValue: FormatValue,
): { value: string; y: number }[] => {
  const range = max - min;
  let stepSize = Math.pow(10, Math.floor(Math.log10(range)));
  if (range / stepSize < 2) stepSize /= 5;
  else if (range / stepSize < 4) stepSize /= 2;
  else if (range / stepSize > 6) stepSize *= 2;
  const yAxisLabels: { value: string; y: number }[] = [];
  for (
    let value = min - (min % stepSize) + stepSize;
    value < max;
    value += stepSize
  ) {
    const y = height - ((value - min) / range) * height;
    yAxisLabels.push({
      value: formatValue(value),
      y,
    });
  }
  return yAxisLabels;
};

const buildChartPath = (
  size: { height: number; width: number },
  items: ChartPoint[],
  yDomain: [number, number],
  type: ChartType,
  yAxisWidth: number,
  smooth?: boolean,
  labelsPosition?: 'left' | 'right',
): {
  data: ChartPoint[];
  getItemAtX(x: number): ChartPoint;
  rawPath: string;
  scaleY: ScaleLinear<number, number>;
} => {
  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const rightOffset = labelsPosition === 'right' ? yAxisWidth : 0;
  const xScaleDomain = items.map((p) => p.index.toString());
  let xScaleRange;
  const effectiveWidth = size.width - yAxisWidth;

  if (type === 'candlestick') {
    const step = effectiveWidth / items.length;
    xScaleRange = items.map((_, i) => leftOffset + step / 2 + step * i);
  } else {
    const step = effectiveWidth / (items.length - 1 || 1);
    xScaleRange = items.map((_, i) => leftOffset + step * i);
  }

  const scaleX = scaleOrdinal().domain(xScaleDomain).range(xScaleRange);
  const scaleY = scaleLinear().domain(yDomain).range([size.height, 0]);

  const rawPath = line()
    .x(([, x]) => scaleX(x.toString()) as number)
    .y(([y]) => scaleY(y))
    .curve(smooth ? curveMonotoneX : curveLinear)(
    items.map((d) => [d.value, d.index]),
  );

  const getItemAtX = (x: number) => {
    'worklet';
    const [domainStart, domainEnd] = [leftOffset, size.width - rightOffset];
    const xNormal = (x - domainStart) / (domainEnd - domainStart);
    const closestIndex = Math.floor(xNormal * (items.length - 1));
    return { ...items[closestIndex], index: closestIndex };
  };

  return {
    data: items,
    getItemAtX,
    rawPath: rawPath ?? '',
    scaleY,
  };
};

const buildPathForChart = (
  size: { height: number; width: number },
  items: ChartPoint[],
  yDomain: [number, number],
  type: ChartType,
  yAxisWidth: number,
  includeZero: boolean,
  formatValue: FormatValue,
  labelsPosition?: 'left' | 'right',
): {
  baselineY: number;
  data: ChartPoint[];
  getItemAtX(x: number): ChartPoint;
  rawPath: string;
  scaleBody(v: number): number;
  scaleY: ScaleLinear<number, number>;
  yAxisLabels: { value: string; y: number }[];
} => {
  const scaleBody = (value: number): number => {
    'worklet';

    return interpolate(
      value,
      [0, Math.max(...yDomain) - Math.min(...yDomain)],
      [0, size.height],
      'clamp',
    );
  };

  const yAxisLabels = buildYAxisLabels(
    yDomain[0],
    yDomain[1],
    size.height,
    formatValue,
  );

  const chartPath = buildChartPath(
    size,
    items,
    yDomain,
    type,
    yAxisWidth,
    undefined,
    labelsPosition,
  );

  return {
    ...chartPath,
    baselineY: includeZero ? chartPath.scaleY(0) : size.height,
    scaleBody,
    yAxisLabels,
  };
};

export interface BuildChartsOptions {
  formatValue: FormatValue;
  labelsPosition?: 'left' | 'right';
  yAxisWidth: number;
}

export interface BuildChartsResult {
  mainCharts: BuiltChart[];
}

export const buildCharts = (
  size: {
    height: number;
    width: number;
  },
  chartData: ChartData,
  { formatValue, labelsPosition, yAxisWidth }: BuildChartsOptions,
): BuildChartsResult => {
  const { includeZero = false, type } = chartData;

  const result = normaliseDataSets(chartData, formatValue).reduce(
    (acc: BuildChartsResult, dataSet) => {
      const { data, label } = dataSet;

      const emptyMainChart: BuiltChart = {
        baselineY: 0,
        data: [],
        getItemAtX: () => null as unknown as ChartPoint,
        label,
        path: null as unknown as RedashPath,
        rawPath: '',
        scaleBody: () => 0,
        scaleY: scaleLinear<number, number>(),
        trend: 'positive',
        yAxisLabels: [],
      };

      if (data.length === 0) {
        acc.mainCharts.push(emptyMainChart);

        return acc;
      }

      const yDomain =
        type === 'candlestick'
          ? getHighLowDomain(data)
          : getValueDomain(data, includeZero);

      const chart = buildPathForChart(
        size,
        data,
        yDomain,
        type,
        yAxisWidth,
        includeZero,
        formatValue,
        labelsPosition,
      );

      if (!chart.rawPath) {
        acc.mainCharts.push(emptyMainChart);
        return acc;
      }

      const firstValue = data[0].value;
      const lastValue = data.at(-1)?.value ?? firstValue;
      const trend: 'negative' | 'positive' =
        lastValue >= firstValue ? 'positive' : 'negative';

      const mainChart: BuiltChart = {
        label,
        path: parse(chart.rawPath),
        trend,
        ...chart,
      };

      acc.mainCharts.push(mainChart);

      return acc;
    },
    { mainCharts: [] },
  );
  return result;
};
