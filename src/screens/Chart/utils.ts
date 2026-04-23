import { scaleLinear, ScaleLinear, scaleOrdinal } from 'd3-scale';
import { curveLinear, curveMonotoneX, line } from 'd3-shape';
import dayjs from 'dayjs';
import { Extrapolate, interpolate } from 'react-native-reanimated';
import { parse, Path as RedashPath } from 'react-native-redash';

import { Y_AXIS_LABELS_WIDTH } from './_components/YAxisLabels';
import { formatNumber } from './formatters';
import { Quote, TimeSlice } from './types';

export type ChartType = 'candlestick' | 'line';

export const X_MARGIN = 32;
export const Y_MARGIN = 4;

export interface Chart {
  data: FormattedItem[];
  dateRangeLabel: string;
  getItemAtX(x: number): FormattedItem;
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return formattedData as any;
};

const getHighLowDomain = (items: FormattedItem[]): [number, number] => {
  'worklet';

  const values = items.flatMap(({ high, low }) => [high, low]);
  return [Math.min(...values), Math.max(...values)];
};

/**
 * The y-domain of the price chart is
 * [(min price or indicator value), (max price or indicator value)]
 */
const priceYDomain = (prices: FormattedItem[]): [number, number] => {
  const priceYDomain = getHighLowDomain(prices);
  return [Math.min(priceYDomain[0]), Math.max(priceYDomain[1])];
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

/**s
 * Builds path. Param offset is needed to HK 3Y time slice.
 * @param offset used when missing data points to span to whole time slice
 */
const buildPath2 = (
  size: { height: number; width: number },
  items: FormattedItem[],
  yDomain: [number, number],
  type: ChartType,
  smooth?: boolean,
): {
  data: FormattedItem[];
  getItemAtX(x: number): FormattedItem;
  rawPath: string;
  scaleY: ScaleLinear<number, number>;
} => {
  const xScaleDomain = items.map((p) => p.date.toString());
  let xScaleRange;
  const effectiveWidth = size.width - Y_AXIS_LABELS_WIDTH;

  if (type == 'candlestick') {
    const step = effectiveWidth / items.length;
    xScaleRange = items.map(
      (_, i) => Y_AXIS_LABELS_WIDTH + step / 2 + step * i,
    );
  } else {
    const step = effectiveWidth / (items.length - 1 || 1);
    xScaleRange = items.map((_, i) => Y_AXIS_LABELS_WIDTH + step * i);
  }

  const scaleX = scaleOrdinal().domain(xScaleDomain).range(xScaleRange);
  const scaleY = scaleLinear().domain(yDomain).range([size.height, 0]);

  const rawPath = line()
    .x(([, x]) => scaleX(x.toString()) as number)
    .y(([y]) => scaleY(y))
    .curve(smooth ? curveMonotoneX : curveLinear)(
    items.map((d) => [d.value, d.date]),
  );

  const formattedData = [...items];

  /**
   * Given x within the specified domain,
   * calculate a normalized value to find the closest element in the array
   */
  const getItemAtX = (x: number) => {
    'worklet';
    const [domainStart, domainEnd] = [Y_AXIS_LABELS_WIDTH, size.width];
    const xNormal = (x - domainStart) / (domainEnd - domainStart);
    const closestIndex = Math.floor(xNormal * (formattedData.length - 1));
    return formattedData[closestIndex];
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    data: items,
    getItemAtX,
    rawPath,
    scaleY,
  } as any;
};

const buildPathForChart = (
  size: { height: number; width: number },
  items: FormattedItem[],
  yDomain: [number, number],
  type: ChartType,
): {
  data: FormattedItem[];
  getItemAtX(x: number): FormattedItem;
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
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      Extrapolate.CLAMP,
    );
  };

  const yAxisLabels = buildYAxisLabels(yDomain[0], yDomain[1], size.height);

  const result = {
    ...buildPath2(size, items, yDomain, type),
    scaleBody,
    yAxisLabels,
  };

  return result;
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
): BuildChartsResult => {
  const result = items.reduce(
    (acc: BuildChartsResult, item) => {
      const timeSliceLabel = `${item.timeSliceAmount}${item.timeSliceType}`;
      const dateRangeLabel = `${item.timeSliceAmount}${item.timeSliceType}`;
      const intervalLabel = `${item.timeSliceAmount}${item.timeSliceType}`;

      const emptyMainChart: any = {
        data: [],
        dateRangeLabel,
        getItemAtX: () => null,
        intervalLabel,
        path: null,
        rawPath: null,
        scaleBody: scaleLinear(),
        scaleY: scaleLinear(),
        timeSliceLabel,
        trend: null,
      };

      if (item.historicalPrices?.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        acc.mainCharts.push(emptyMainChart);

        return acc;
      }

      const prices = [...(item.historicalPrices ?? [])];

      const priceData = dataFormatter(prices, 'close');
      const yDomain = priceYDomain(priceData);

      const chart = buildPathForChart(size, priceData, yDomain, type);

      if (!chart.rawPath) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        acc.mainCharts.push(emptyMainChart);
        return acc;
      }

      const trend =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        chart.data &&
        chart.data.length > 0 &&
        chart.data[chart.data.length - 1] &&
        Number(chart.data[chart.data.length - 1].change) >= 0
          ? 'positive'
          : 'negative';

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

/**
 * Filters prices with timestamp <= quote timestamp.
 * Preps Mock data according to line chart if only 1 data point.
 */
export const formatTimeSlice = (
  timeSlice: TimeSlice,
  quote: null | Quote,
  chartType: ChartType,
): TimeSlice => {
  if (!quote) return timeSlice;

  let historicalPrices = timeSlice.historicalPrices;

  // Filter out prices in case historical prices are more updated than the quote
  // Sometimes AAStocks historical prices updates faster then quote
  historicalPrices = historicalPrices?.filter((p) => {
    if (!p.date) return false;

    return dayjs(p.date).valueOf() <= dayjs(quote.date).valueOf();
  });

  // When there is only one price, add mock data. (need 2 points to form a line)
  if (historicalPrices?.length === 1 && chartType === 'line') {
    const mockDate = dayjs(historicalPrices[0].date).subtract(1, 'hour');
    historicalPrices = [
      {
        ...historicalPrices[0],
        date: mockDate.toISOString(),
        isMockData: true,
        timestamp: mockDate.valueOf(),
        volume: null,
      } as Quote,
      {
        ...historicalPrices[0],
      },
    ];
  }

  return {
    ...timeSlice,
    historicalPrices,
  };
};
