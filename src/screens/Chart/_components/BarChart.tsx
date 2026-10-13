import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme';

import {
  CANDLESTICK_MARGIN,
  MAX_BAR_WIDTH,
  X_MARGIN,
  Y_AXIS_LABELS_WIDTH,
  Y_MARGIN,
} from '../constants';
import { BuiltChart, ChartPoint } from '../utils';
import BarChartBar from './BarChartBar';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

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
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const theme = useTheme();
  const barChartWidth = width - Y_AXIS_LABELS_WIDTH;

  return (
    <View style={{ width: width + X_MARGIN }}>
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
        labelsPosition={labelsPosition}
        width={width}
      />
      <Svg height={height + Y_MARGIN * 2} width={width + X_MARGIN}>
        <YAxisLines
          charts={charts}
          currentChartIndex={currentChartIndex}
          labelsPosition={labelsPosition}
          width={width}
        />

        {chart.data.map((d, i) => {
          return (
            <BarChartBar
              barWidth={Math.min(
                barChartWidth / chart.data.length - CANDLESTICK_MARGIN * 2,
                MAX_BAR_WIDTH,
              )}
              calculateBarHeight={(value: number) =>
                height - chart.scaleY(value)
              }
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
          stroke={theme.colors.gray400}
          strokeWidth={1}
          transform={[{ translateY: Y_MARGIN }]}
          x1={leftOffset}
          x2={leftOffset + barChartWidth}
          y1={height}
          y2={height}
        />
      </Svg>

      {children}
    </View>
  );
}

export default BarChart;
