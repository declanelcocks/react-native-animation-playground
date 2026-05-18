import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { runOnJS } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Chart, FormattedItemWithIndex, Y_MARGIN } from '../utils';
import BarChartBar from './BarChartBar';
import YAxisLabels, { Y_AXIS_LABELS_WIDTH, YAxisLines } from './YAxisLabels';

interface Props {
  barGap?: number;
  barWidth?: number;
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function ScrollableBarChart({
  barGap = 8,
  barWidth = 32,
  charts,
  currentChartIndex,
  currentPrice,
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
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg height={height + Y_MARGIN * 2} width={width}>
          <YAxisLines
            charts={charts}
            currentChartIndex={currentChartIndex}
            labelsPosition={labelsPosition}
            width={width}
          />
        </Svg>
      </View>

      {/* Scrollable bars, inset to avoid sliding under the label column */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { left: leftOffset, right: rightOffset },
        ]}
      >
        <ScrollView
          bounces={false}
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
        >
          <Svg height={height + Y_MARGIN * 2} width={totalBarsWidth}>
            {currentChart.data.map((d, i) => (
              <BarChartBar
                barWidth={barWidth}
                calculateBarHeight={(value: number) =>
                  height - currentChart.scaleY(value)
                }
                calculateYValue={(value: number) => currentChart.scaleY(value)}
                currentPrice={currentPrice}
                data={{ ...d, index: i }}
                key={i}
                leftOffset={0}
                onPress={() => {
                  currentPrice.set({ ...d, index: i });
                }}
                step={step}
              />
            ))}

            <Line
              stroke={theme.colors.gray400}
              strokeWidth={1}
              transform={[{ translateY: Y_MARGIN }]}
              x1={0}
              x2={totalBarsWidth}
              y1={height}
              y2={height}
            />
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
