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
      includeZero?: undefined;
      type: 'candlestick';
    }
  | {
      dataSets: DataSet<DataPoint>[];
      /**
       * Bar charts only. Starts the y-axis at zero, so bar heights are
       * proportional to their values. Without it the axis is padded around the
       * min and max.
       */
      includeZero?: boolean;
      type: 'bar-scrollable' | 'bar';
    }
  | {
      dataSets: DataSet<DataPoint>[];
      includeZero?: undefined;
      type: 'line';
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
