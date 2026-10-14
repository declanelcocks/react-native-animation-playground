import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { BuiltChart, ChartPoint } from '../../utils/buildCharts';
import { useChartTheme } from '../../utils/theme';
import BarChartBar from '../BarChartBar';
import YAxisLabels, { YAxisLines } from '../YAxisLabels';

interface Props {
  activePoint: SharedValue<ChartPoint | null>;
  barGap?: number;
  barWidth?: number;
  chart: BuiltChart;
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function ScrollableBarChart({
  activePoint,
  barGap = 8,
  barWidth = 32,
  chart,
  charts,
  currentChartIndex,
  height,
  labelsPosition,
  width,
}: Props) {
  const theme = useChartTheme();
  const { yAxisWidth, yMargin } = theme.layout;
  const scrollRef = useRef<ScrollView>(null);

  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const rightOffset = labelsPosition === 'right' ? yAxisWidth : 0;

  const step = barWidth + barGap;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [chart]);

  const totalBarsWidth = chart.data.length * step;

  return (
    <View style={{ height: height + yMargin * 2, width }}>
      {/* Sticky Y-axis reference lines */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
      >
        <Svg height={height + yMargin * 2} width={width}>
          <YAxisLines
            charts={charts}
            currentChartIndex={currentChartIndex}
            labelsPosition={labelsPosition}
            width={width}
          />

          <Line
            stroke={theme.colors.axisLine}
            strokeWidth={1}
            transform={[{ translateY: yMargin }]}
            x1={leftOffset}
            x2={width - rightOffset}
            y1={chart.baselineY}
            y2={chart.baselineY}
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
          <Svg height={height + yMargin * 2} width={totalBarsWidth}>
            {chart.data.map((d, i) => (
              <BarChartBar
                activePoint={activePoint}
                barWidth={barWidth}
                baselineY={chart.baselineY}
                calculateYValue={(value: number) => chart.scaleY(value)}
                chartHeight={height}
                data={{ ...d, index: i }}
                key={i}
                leftOffset={0}
                onPress={() => {
                  activePoint.set({ ...d, index: i });
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
