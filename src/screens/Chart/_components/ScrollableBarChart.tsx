import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { runOnJS } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Y_AXIS_LABELS_WIDTH, Y_MARGIN } from '../constants';
import { BuiltChart, ChartPoint } from '../utils';
import BarChartBar from './BarChartBar';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

interface Props {
  barGap?: number;
  barWidth?: number;
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  currentPoint: SharedValue<ChartPoint | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function ScrollableBarChart({
  barGap = 8,
  barWidth = 32,
  charts,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: Props) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [chartIndex, setChartIndex] = useState(0);

  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const rightOffset = labelsPosition === 'right' ? Y_AXIS_LABELS_WIDTH : 0;

  const step = barWidth + barGap;

  const scrollToEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  useAnimatedReaction(
    () => currentChartIndex.value,
    (current) => {
      if (current !== chartIndex) {
        runOnJS(setChartIndex)(current);
      }
      runOnJS(scrollToEnd)();
    },
  );

  const currentChart = charts[chartIndex] ?? charts[0];
  const totalBarsWidth = currentChart.data.length * step;

  return (
    <View style={{ height: height + Y_MARGIN * 2, width }}>
      {/* Sticky Y-axis reference lines */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
      >
        <Svg height={height + Y_MARGIN * 2} width={width}>
          <YAxisLines
            charts={charts}
            currentChartIndex={currentChartIndex}
            labelsPosition={labelsPosition}
            width={width}
          />

          <Line
            stroke={theme.colors.gray400}
            strokeWidth={1}
            transform={[{ translateY: Y_MARGIN }]}
            x1={leftOffset}
            x2={width - rightOffset}
            y1={height}
            y2={height}
          />
        </Svg>
      </View>

      {/* Scrollable bars, inset to avoid sliding under the label column */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { left: leftOffset, right: rightOffset, zIndex: 2 },
        ]}
      >
        <ScrollView decelerationRate="fast" horizontal ref={scrollRef}>
          <Svg height={height + Y_MARGIN * 2} width={totalBarsWidth}>
            {currentChart.data.map((d, i) => (
              <BarChartBar
                barWidth={barWidth}
                calculateBarHeight={(value: number) =>
                  height - currentChart.scaleY(value)
                }
                calculateYValue={(value: number) => currentChart.scaleY(value)}
                chartHeight={height}
                currentPoint={currentPoint}
                data={{ ...d, index: i }}
                key={i}
                leftOffset={0}
                onPress={() => {
                  currentPoint.set({ ...d, index: i });
                }}
                step={step}
              />
            ))}
          </Svg>
        </ScrollView>
      </View>

      {/* Sticky Y-axis labels */}
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
        height={height}
        labelsPosition={labelsPosition}
        width={width}
      />
    </View>
  );
}

export default ScrollableBarChart;
