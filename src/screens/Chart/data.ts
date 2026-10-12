import { CandlestickDataPoint, DataSet } from './types';

interface RawPoint extends Omit<CandlestickDataPoint, 'label'> {
  date: string;
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (isoDate: string) => {
  const time = new Date(isoDate).toLocaleTimeString('en', {
    hour: 'numeric',
    minute: 'numeric',
  });

  return `${formatDate(isoDate)} @ ${time}`;
};

const toDataSet = (
  label: string,
  points: RawPoint[],
  formatLabel: (isoDate: string) => string,
): DataSet<CandlestickDataPoint> => ({
  data: points.map(({ date, ...point }) => ({
    ...point,
    label: formatLabel(date),
  })),
  label,
});

const dataSetAPoints: RawPoint[] = [
  {
    close: 57.01,
    date: '2026-02-20T01:40:00Z',
    high: 57.05,
    low: 56.8,
    open: 56.8,
  },
  { close: 57.05, date: '2026-02-20T01:50:00Z', high: 57.1, low: 57, open: 57 },
  {
    close: 56.9,
    date: '2026-02-20T02:00:00Z',
    high: 57.05,
    low: 56.9,
    open: 57.05,
  },
  {
    close: 56.95,
    date: '2026-02-20T02:10:00Z',
    high: 56.95,
    low: 56.9,
    open: 56.95,
  },
  {
    close: 56.75,
    date: '2026-02-20T02:20:00Z',
    high: 56.95,
    low: 56.7,
    open: 56.95,
  },
  {
    close: 56.65,
    date: '2026-02-20T02:30:00Z',
    high: 56.75,
    low: 56.6,
    open: 56.75,
  },
  {
    close: 56.7,
    date: '2026-02-20T02:40:00Z',
    high: 56.75,
    low: 56.65,
    open: 56.65,
  },
  {
    close: 56.7,
    date: '2026-02-20T02:50:00Z',
    high: 56.7,
    low: 56.6,
    open: 56.7,
  },
  {
    close: 56.75,
    date: '2026-02-20T03:00:00Z',
    high: 56.8,
    low: 56.65,
    open: 56.7,
  },
  {
    close: 56.8,
    date: '2026-02-20T03:10:00Z',
    high: 56.8,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.8,
    date: '2026-02-20T03:20:00Z',
    high: 56.8,
    low: 56.75,
    open: 56.8,
  },
  {
    close: 56.8,
    date: '2026-02-20T03:30:00Z',
    high: 56.8,
    low: 56.7,
    open: 56.8,
  },
  {
    close: 56.75,
    date: '2026-02-20T03:40:00Z',
    high: 56.8,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.7,
    date: '2026-02-20T03:50:00Z',
    high: 56.75,
    low: 56.65,
    open: 56.7,
  },
  {
    close: 56.7,
    date: '2026-02-20T04:00:00Z',
    high: 56.7,
    low: 56.65,
    open: 56.7,
  },
  {
    close: 56.75,
    date: '2026-02-20T05:10:00Z',
    high: 56.75,
    low: 56.65,
    open: 56.7,
  },
  {
    close: 56.75,
    date: '2026-02-20T05:20:00Z',
    high: 56.75,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.75,
    date: '2026-02-20T05:30:00Z',
    high: 56.75,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.75,
    date: '2026-02-20T05:40:00Z',
    high: 56.75,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.8,
    date: '2026-02-20T05:50:00Z',
    high: 56.8,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.9,
    date: '2026-02-20T05:55:00Z',
    high: 56.8,
    low: 56.75,
    open: 56.8,
  },
];

const dataSetBPoints: RawPoint[] = [
  {
    close: 54.1,
    date: '2026-02-01T01:40:00Z',
    high: 54.25,
    low: 53.95,
    open: 54.05,
  },
  {
    close: 54.5,
    date: '2026-02-02T01:50:00Z',
    high: 54.6,
    low: 54.05,
    open: 54.1,
  },
  {
    close: 54.3,
    date: '2026-02-03T02:00:00Z',
    high: 54.55,
    low: 54.25,
    open: 54.5,
  },
  {
    close: 54.75,
    date: '2026-02-04T02:10:00Z',
    high: 54.85,
    low: 54.25,
    open: 54.3,
  },
  {
    close: 54.55,
    date: '2026-02-05T02:20:00Z',
    high: 54.8,
    low: 54.5,
    open: 54.75,
  },
  {
    close: 55.05,
    date: '2026-02-06T02:30:00Z',
    high: 55.15,
    low: 54.5,
    open: 54.55,
  },
  {
    close: 54.85,
    date: '2026-02-07T02:40:00Z',
    high: 55.1,
    low: 54.8,
    open: 55.05,
  },
  {
    close: 55.35,
    date: '2026-02-08T02:50:00Z',
    high: 55.45,
    low: 54.8,
    open: 54.85,
  },
  {
    close: 55.6,
    date: '2026-02-09T03:00:00Z',
    high: 55.7,
    low: 55.3,
    open: 55.35,
  },
  {
    close: 55.4,
    date: '2026-02-10T03:10:00Z',
    high: 55.65,
    low: 55.35,
    open: 55.6,
  },
  {
    close: 56,
    date: '2026-02-11T03:20:00Z',
    high: 56.1,
    low: 55.35,
    open: 55.4,
  },
  {
    close: 56.5,
    date: '2026-02-12T03:30:00Z',
    high: 56.6,
    low: 55.95,
    open: 56,
  },
  {
    close: 57.05,
    date: '2026-02-13T03:40:00Z',
    high: 57.15,
    low: 56.45,
    open: 56.5,
  },
  {
    close: 56.75,
    date: '2026-02-14T03:50:00Z',
    high: 57.1,
    low: 56.7,
    open: 57.05,
  },
  {
    close: 57,
    date: '2026-02-15T04:00:00Z',
    high: 57.05,
    low: 56.7,
    open: 56.75,
  },
  {
    close: 56.6,
    date: '2026-02-16T05:10:00Z',
    high: 57.05,
    low: 56.55,
    open: 57,
  },
  {
    close: 56.25,
    date: '2026-02-17T05:20:00Z',
    high: 56.65,
    low: 56.2,
    open: 56.6,
  },
  {
    close: 56.45,
    date: '2026-02-18T05:30:00Z',
    high: 56.5,
    low: 56.2,
    open: 56.25,
  },
  {
    close: 55.95,
    date: '2026-02-19T05:40:00Z',
    high: 56.5,
    low: 55.9,
    open: 56.45,
  },
  {
    close: 55.55,
    date: '2026-02-20T05:50:00Z',
    high: 56,
    low: 55.5,
    open: 55.95,
  },
  {
    close: 55.75,
    date: '2026-02-21T05:55:00Z',
    high: 56.2,
    low: 55.7,
    open: 56.15,
  },
];

export const dataSetA = toDataSet('A', dataSetAPoints, formatDateTime);

export const dataSetB = toDataSet('B', dataSetBPoints, formatDate);
