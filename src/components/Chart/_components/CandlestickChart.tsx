import { PropsWithChildren } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { useChartTheme } from '../theme';
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
  const { barMargin, maxBarWidth, yAxisWidth } = useChartTheme().layout;
  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const candlestickChartWidth = width - yAxisWidth;

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
              candlestickChartWidth / chart.data.length - barMargin * 2,
              maxBarWidth,
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
