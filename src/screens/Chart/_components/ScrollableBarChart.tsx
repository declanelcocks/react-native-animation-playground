import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Y_AXIS_LABELS_WIDTH, Y_MARGIN } from '../constants';
import { BuiltChart, ChartPoint } from '../utils';
import BarChartBar from './BarChartBar';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

interface Props {
  barGap?: number;
  barWidth?: number;
  chart: BuiltChart;
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
  chart,
  charts,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: Props) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const rightOffset = labelsPosition === 'right' ? Y_AXIS_LABELS_WIDTH : 0;

  const step = barWidth + barGap;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [chart]);

  const totalBarsWidth = chart.data.length * step;

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
            {chart.data.map((d, i) => (
              <BarChartBar
                barWidth={barWidth}
                calculateBarHeight={(value: number) =>
                  height - chart.scaleY(value)
                }
                calculateYValue={(value: number) => chart.scaleY(value)}
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
        labelsPosition={labelsPosition}
        width={width}
      />
    </View>
  );
}

export default ScrollableBarChart;
