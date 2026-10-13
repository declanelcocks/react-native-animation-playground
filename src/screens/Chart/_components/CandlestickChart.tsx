import { PropsWithChildren } from 'react';
import { SharedValue } from 'react-native-reanimated';

import {
  CANDLESTICK_MARGIN,
  MAX_BAR_WIDTH,
  Y_AXIS_LABELS_WIDTH,
} from '../constants';
import { BuiltChart, ChartPoint } from '../utils';
import CandlestickChartCandle from './CandlestickChartCandle';
import SteppedChartFrame from './SteppedChartFrame';

interface Props {
  chart: BuiltChart;
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  currentPoint: SharedValue<ChartPoint | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function CandlestickChart({
  chart,
  charts,
  children,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: PropsWithChildren<Props>) {
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;

  return (
    <SteppedChartFrame
      charts={charts}
      currentChartIndex={currentChartIndex}
      height={height}
      labelsPosition={labelsPosition}
      plot={chart.data.map((d, i) => {
        return (
          <CandlestickChartCandle
            calculateCandleHeight={(size: number) => chart.scaleBody(size)}
            calculateYValue={(value: number) => chart.scaleY(value)}
            candleWidth={Math.min(
              candlestickChartWidth / chart.data.length -
                CANDLESTICK_MARGIN * 2,
              MAX_BAR_WIDTH,
            )}
            currentPoint={currentPoint}
            data={{ ...d, index: i }}
            key={i}
            leftOffset={leftOffset}
            step={candlestickChartWidth / chart.data.length}
          />
        );
      })}
      width={width}
    >
      {children}
    </SteppedChartFrame>
  );
}

export default CandlestickChart;
