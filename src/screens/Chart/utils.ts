import { scaleLinear, ScaleLinear, scaleOrdinal } from 'd3-scale';
import { curveLinear, curveMonotoneX, line } from 'd3-shape';
import { interpolate } from 'react-native-reanimated';
import { parse, Path as RedashPath } from 'react-native-redash';

import { Y_AXIS_LABELS_WIDTH } from './_components/YAxisLabels';
import { formatNumber } from './formatters';
import { Quote, TimeSlice } from './types';

export type ChartType = 'bar' | 'bar-scrollable' | 'candlestick' | 'line';

export const X_MARGIN = 32;
export const Y_MARGIN = 4;

export interface Chart {
  data: FormattedItem[];
  dateRangeLabel: string;
  getItemAtX(x: number): FormattedItemWithIndex;
  intervalLabel: string;
  path: RedashPath;
  rawPath: string;
  scaleBody(v: number): number;
  scaleY: ScaleLinear<number, number>;
  timeSliceLabel: string;
  trend: 'negative' | 'positive';
  yAxisLabels?: YAxisLabel[];
}

export interface FormattedItem {
  change?: string;
  changeRatio?: string;
  close?: number;
  currencySymbol?: string;
  date: number;
  high?: number;
  isMockData?: boolean;
  isRealTime?: boolean;
  low?: number;
  open?: number;
  quoteType?: 'close' | 'delayed' | 'realtime';
  relativeDateTimeLabel?: string;
  value: number;
  volume?: number;
  xAxisPct?: number;
}

export interface FormattedItemWithIndex extends FormattedItem {
  index: number;
}

export interface YAxisLabel {
  value: string;
  y: number;
}

const dataFormatter = (data: Quote[], valueKey: string): FormattedItem[] => {
  const formattedData = data
    .map((d: Quote) => {
      return {
        ...d,
        close: Number(d.close),
        date: d.date ? new Date(d.date).valueOf() : null,
        high: Number(d.high),
        low: Number(d.low),
        open: Number(d.open),
        quoteType:
          d.isRealTime === true
            ? ('realtime' as const)
            : d.isRealTime === false
              ? ('delayed' as const)
              : ('close' as const),
        value: Number(d[valueKey as keyof Quote]),
      };
    })
    .filter((d) => !!d.value && !!d.date);

  return formattedData as FormattedItem[];
};

const getHighLowDomain = (items: FormattedItem[]): [number, number] => {
  const values = items
    .flatMap(({ high, low }) => [high, low])
    .filter((v): v is number => v !== undefined);
  return [Math.min(...values), Math.max(...values)];
};

const getValueDomain = (items: FormattedItem[], paddingPct = 0.1): [number, number] => {
  const values = items.map((d) => d.value).filter((v) => !Number.isNaN(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const padding = range > 0 ? range * paddingPct : Math.abs(max) * paddingPct || paddingPct;
  return [min - padding, max + padding];
};

const buildYAxisLabels = (
  min: number,
  max: number,
  height: number,
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
      value: formatNumber(value, '1.2-2'),
      y,
    });
  }
  return yAxisLabels;
};

const buildChartPath = (
  size: { height: number; width: number },
  items: FormattedItem[],
  yDomain: [number, number],
  type: ChartType,
  smooth?: boolean,
  labelsPosition?: 'left' | 'right',
): {
  data: FormattedItem[];
  getItemAtX(x: number): FormattedItemWithIndex;
  rawPath: string;
  scaleY: ScaleLinear<number, number>;
} => {
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const rightOffset = labelsPosition === 'right' ? Y_AXIS_LABELS_WIDTH : 0;
  const xScaleDomain = items.map((p) => p.date.toString());
  let xScaleRange;
  const effectiveWidth = size.width - Y_AXIS_LABELS_WIDTH;

  if (type === 'candlestick') {
    const step = effectiveWidth / items.length;
    xScaleRange = items.map(
      (_, i) => leftOffset + step / 2 + step * i,
    );
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
    items.map((d) => [d.value, d.date]),
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
  items: FormattedItem[],
  yDomain: [number, number],
  type: ChartType,
  labelsPosition?: 'left' | 'right',
): {
  data: FormattedItem[];
  getItemAtX(x: number): FormattedItemWithIndex;
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

  const yAxisLabels = buildYAxisLabels(yDomain[0], yDomain[1], size.height);

  return {
    ...buildChartPath(size, items, yDomain, type, undefined, labelsPosition),
    scaleBody,
    yAxisLabels,
  };
};

export interface BuildChartsResult {
  mainCharts: Chart[];
}

export const buildCharts = (
  size: {
    height: number;
    width: number;
  },
  items: TimeSlice[],
  type: ChartType,
  labelsPosition?: 'left' | 'right',
): BuildChartsResult => {
  const result = items.reduce(
    (acc: BuildChartsResult, item) => {
      const timeSliceLabel = `${item.timeSliceAmount}${item.timeSliceType}`;
      const dateRangeLabel = `${item.timeSliceAmount}${item.timeSliceType}`;
      const intervalLabel = `${item.timeSliceAmount}${item.timeSliceType}`;

      const emptyMainChart: Chart = {
        data: [],
        dateRangeLabel,
        getItemAtX: () => null as unknown as FormattedItemWithIndex,
        intervalLabel,
        path: null as unknown as RedashPath,
        rawPath: '',
        scaleBody: () => 0,
        scaleY: scaleLinear<number, number>(),
        timeSliceLabel,
        trend: 'negative',
        yAxisLabels: [],
      };

      if (item.historicalPrices?.length === 0) {
        acc.mainCharts.push(emptyMainChart);

        return acc;
      }

      const prices = [...(item.historicalPrices ?? [])];

      const priceData = dataFormatter(prices, 'close');
      const yDomain = type === 'candlestick'
        ? getHighLowDomain(priceData)
        : getValueDomain(priceData);

      const chart = buildPathForChart(size, priceData, yDomain, type, labelsPosition);

      if (!chart.rawPath) {
        acc.mainCharts.push(emptyMainChart);
        return acc;
      }

      const lastChange = chart.data.at(-1)?.change;
      const trend: 'negative' | 'positive' =
        lastChange !== undefined && Number(lastChange) >= 0 ? 'positive' : 'negative';

      const mainChart: Chart = {
        dateRangeLabel,
        intervalLabel,
        path: parse(chart.rawPath),
        timeSliceLabel,
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
