export interface CandlestickDataPoint {
  close: number;
  high: number;
  label?: string;
  low: number;
  open: number;
}

export type ChartData =
  | {
      dataSets: DataSet<CandlestickDataPoint>[];
      type: 'candlestick';
    }
  | {
      dataSets: DataSet<DataPoint>[];
      type: Exclude<ChartType, 'candlestick'>;
    };

export type ChartType = 'bar-scrollable' | 'bar' | 'candlestick' | 'line';

export interface DataPoint {
  label?: string;
  value: number;
}

export interface DataSet<T> {
  data: T[];
  label: string;
}
