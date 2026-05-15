import { PropsWithChildren, useState } from 'react';
import { View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { runOnJS } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Chart, FormattedItemWithIndex, X_MARGIN, Y_MARGIN } from '../utils';
import BarChartBar from './BarChartBar';
import { CANDLESTICK_MARGIN } from './CandlestickChart';
import YAxisLabels, { Y_AXIS_LABELS_WIDTH, YAxisLines } from './YAxisLabels';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function BarChart({
  charts,
  children,
  currentChartIndex,
  currentPrice,
  height,
  labelsPosition,
  width,
}: PropsWithChildren<Props>) {
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const [chartIndex, setChartIndex] = useState<number>();

  useAnimatedReaction(
    () => currentChartIndex.value,
    (current) => {
      if (current !== chartIndex) {
        runOnJS(setChartIndex)(current);
      }
    },
  );

  const theme = useTheme();
  const barChartWidth = width - Y_AXIS_LABELS_WIDTH;
  const currentChart = charts[currentChartIndex.get()];

  return (
    <View style={{ width: width + X_MARGIN }}>
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
        height={height}
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

        {currentChart.data.map((d, i) => {
          return (
            <BarChartBar
              barWidth={Math.min(
                barChartWidth / currentChart.data.length -
                  CANDLESTICK_MARGIN * 2,
                30,
              )}
              calculateBarHeight={(value: number) =>
                height - currentChart.scaleY(value)
              }
              calculateYValue={(value: number) => currentChart.scaleY(value)}
              currentPrice={currentPrice}
              data={{ ...d, index: i }}
              key={i}
              leftOffset={leftOffset}
              step={barChartWidth / currentChart.data.length}
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
