import { PropsWithChildren } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { Line } from 'react-native-svg';

import { useChartTheme } from '../theme';
import { BuiltChart, ChartPoint } from '../utils';
import BarChartBar from './BarChartBar';
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

export function BarChart({
  chart,
  charts,
  children,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: PropsWithChildren<Props>) {
  const theme = useChartTheme();
  const { barMargin, maxBarWidth, yAxisWidth, yMargin } = theme.layout;
  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const barChartWidth = width - yAxisWidth;

  return (
    <SteppedChartFrame
      charts={charts}
      currentChartIndex={currentChartIndex}
      height={height}
      labelsPosition={labelsPosition}
      plot={
        <>
          {chart.data.map((d, i) => {
            return (
              <BarChartBar
                barWidth={Math.min(
                  barChartWidth / chart.data.length - barMargin * 2,
                  maxBarWidth,
                )}
                baselineY={chart.baselineY}
                calculateYValue={(value: number) => chart.scaleY(value)}
                chartHeight={height}
                currentPoint={currentPoint}
                data={{ ...d, index: i }}
                key={i}
                leftOffset={leftOffset}
                step={barChartWidth / chart.data.length}
              />
            );
          })}

          <Line
            stroke={theme.colors.axisLine}
            strokeWidth={1}
            transform={[{ translateY: yMargin }]}
            x1={leftOffset}
            x2={leftOffset + barChartWidth}
            y1={chart.baselineY}
            y2={chart.baselineY}
          />
        </>
      }
      width={width}
    >
      {children}
    </SteppedChartFrame>
  );
}

export default BarChart;
