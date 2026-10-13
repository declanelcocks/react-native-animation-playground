import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { clamp, getYForX, useVector } from 'react-native-redash';

import ActivePointLabel from './_components/ActivePointLabel';
import BarChart from './_components/BarChart';
import CandlestickChart from './_components/CandlestickChart';
import CrosshairCursor from './_components/CrosshairCursor';
import DataSetButton from './_components/DataSetButton';
import LineChart from './_components/LineChart';
import LineChartCursor from './_components/LineChartCursor';
import ScrollableBarChart from './_components/ScrollableBarChart';
import {
  ChartThemeContext,
  ChartThemeOverride,
  mergeChartTheme,
  useChartTheme,
} from './theme';
import { ChartData } from './types';
import { buildCharts, ChartPoint } from './utils';
export type ChartProps = {
  /** Overrides the defaults in `DEFAULT_CHART_THEME`. Keep it referentially stable. */
  theme?: ChartThemeOverride;
} & ChartContentProps;

type ChartContentProps = {
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
} & ChartData;

function Chart({ theme, ...props }: ChartProps) {
  const mergedTheme = useMemo(() => mergeChartTheme(theme), [theme]);

  return (
    <ChartThemeContext.Provider value={mergedTheme}>
      <ChartContent {...props} />
    </ChartThemeContext.Provider>
  );
}

function ChartContent({
  dataSets,
  height,
  includeZero,
  labelsPosition,
  type,
  width,
}: ChartContentProps) {
  const { animation, layout } = useChartTheme();
  const { yAxisWidth, yMargin } = layout;
  const transition = useSharedValue(1);
  const isCursorActive = useSharedValue(false);
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);
  // JS-side mirror of `currentChartIndex`, so the bar and candlestick charts
  // re-render with the selected data set.
  const [chartIndex, setChartIndex] = useState(0);

  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const rightOffset = labelsPosition === 'right' ? yAxisWidth : 0;
  const lineChartEndX = width - rightOffset;

  const { mainCharts: charts } = useMemo(
    () =>
      buildCharts(
        { height, width },
        // `dataSets`, `includeZero` and `type` come from the same ChartData props, so they
        // still match even though destructuring loses that link for TS.
        { dataSets, includeZero, type } as ChartData,
        yAxisWidth,
        labelsPosition,
      ),
    [dataSets, includeZero, type, height, width, yAxisWidth, labelsPosition],
  );

  const translation = useVector() as {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };

  const activePoint = useSharedValue<ChartPoint | null>(null);

  const plotWidth = width - yAxisWidth;

  // Moves the cursor along the line to `x`, and reads the point under it.
  const moveLineCursor = useCallback(
    (x: number) => {
      'worklet';

      const chart = charts[currentChartIndex.get()];

      translation.x.set(x);
      translation.y.set((getYForX(chart.path, x) ?? 0) + yMargin);
      activePoint.set(chart.getItemAtX(x));
    },
    [
      charts,
      currentChartIndex,
      activePoint,
      translation.x,
      translation.y,
      yMargin,
    ],
  );

  // Snaps the cursor to the centre of the step under `x` (or the last step, if
  // `x` is past it). `y` is only applied when given.
  const moveSteppedCursor = useCallback(
    (x: number, y?: number) => {
      'worklet';

      const chart = charts[currentChartIndex.get()];
      const step = plotWidth / chart.data.length;
      const endX = leftOffset + plotWidth - step / 2;

      // The steps start at `leftOffset`, so snap relative to it.
      const snappedX = clamp(
        leftOffset + Math.floor((x - leftOffset) / step) * step + step / 2,
        leftOffset + step / 2,
        endX,
      );
      const dataPointIndex = Math.floor((snappedX - leftOffset) / step);

      translation.x.set(snappedX);
      if (y !== undefined) {
        translation.y.set(clamp(y, 0, height) || 0);
      }
      activePoint.set({
        ...chart.data[dataPointIndex],
        index: dataPointIndex,
      });
    },
    [
      charts,
      currentChartIndex,
      activePoint,
      height,
      leftOffset,
      plotWidth,
      translation.x,
      translation.y,
    ],
  );

  useEffect(() => {
    if (type === 'line') {
      moveLineCursor(lineChartEndX);
    } else {
      moveSteppedCursor(leftOffset + plotWidth, 0);
    }
  }, [
    leftOffset,
    lineChartEndX,
    moveLineCursor,
    moveSteppedCursor,
    plotWidth,
    type,
  ]);

  const chartDisplayProps = useAnimatedStyle(() => {
    return {
      display:
        charts[currentChartIndex.get()].data.length > 0 ? 'flex' : 'none',
    };
  });

  const previousTrend = useDerivedValue(
    () => charts[previousChartIndex.get()]?.trend ?? 'positive',
  );

  const currentTrend = useDerivedValue(
    () => charts[currentChartIndex.get()]?.trend ?? 'positive',
  );

  const onGestureEvent = Gesture.Pan()
    .activeOffsetX(32)
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onBegin(({ x }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      moveLineCursor(clamp(x, leftOffset, lineChartEndX));
    })
    .onUpdate(({ x }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      moveLineCursor(clamp(x, leftOffset, lineChartEndX));
    })
    .onFinalize(() => {
      isCursorActive.set(false);
      moveLineCursor(lineChartEndX);
    });

  const onClampedGestureEvent = Gesture.Pan()
    .activeOffsetX(32)
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onBegin(({ x, y }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      moveSteppedCursor(x, y);
    })
    .onUpdate(({ x, y }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      moveSteppedCursor(x, y);
    })
    .onFinalize(() => {
      isCursorActive.set(false);
      moveSteppedCursor(leftOffset + plotWidth);
    });

  const selectDataSet = useCallback(
    (index: number) => {
      if (index === currentChartIndex.get()) return;

      previousChartIndex.set(currentChartIndex.get());

      currentChartIndex.set(index);
      setChartIndex(index);

      transition.set(0);
      transition.set(
        withTiming(1, {
          duration: animation.transitionDuration,
        }),
      );

      if (charts[index]?.data?.length) {
        if (type === 'line') {
          translation.x.set(lineChartEndX);

          translation.y.set(
            withTiming(
              (getYForX(
                charts[currentChartIndex.get()].path,
                translation.x.get(),
              ) ?? 0) + yMargin,
              {
                duration: animation.transitionDuration,
              },
            ),
          );

          activePoint.set(charts[index].getItemAtX(lineChartEndX));
        } else {
          moveSteppedCursor(leftOffset + plotWidth, 0);
        }
      } else {
        translation.x.set(lineChartEndX);
        translation.y.set(0);

        activePoint.set(null);
      }
    },
    [
      currentChartIndex,
      previousChartIndex,
      transition,
      charts,
      setChartIndex,
      translation.x,
      translation.y,
      lineChartEndX,
      activePoint,
      animation.transitionDuration,
      yMargin,
      type,
      leftOffset,
      plotWidth,
      moveSteppedCursor,
    ],
  );

  return (
    <View style={{ padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <ActivePointLabel
          activePoint={activePoint}
          chartIndex={currentChartIndex}
          charts={charts}
        />
      </View>

      <Animated.View style={chartDisplayProps}>
        {type === 'candlestick' && (
          <View>
            <CandlestickChart
              activePoint={activePoint}
              chart={charts[chartIndex]}
              charts={charts}
              currentChartIndex={currentChartIndex}
              height={height}
              labelsPosition={labelsPosition}
              width={width}
            >
              <View style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={onClampedGestureEvent}>
                  <Animated.View style={StyleSheet.absoluteFill}>
                    <CrosshairCursor
                      height={height}
                      isCursorActive={isCursorActive}
                      translation={translation}
                      width={width}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </CandlestickChart>
          </View>
        )}

        {type === 'bar' && (
          <View>
            <BarChart
              activePoint={activePoint}
              chart={charts[chartIndex]}
              charts={charts}
              currentChartIndex={currentChartIndex}
              height={height}
              labelsPosition={labelsPosition}
              width={width}
            >
              <View style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={onClampedGestureEvent}>
                  <Animated.View style={StyleSheet.absoluteFill}>
                    <CrosshairCursor
                      height={height}
                      isCursorActive={isCursorActive}
                      translation={translation}
                      width={width}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </BarChart>
          </View>
        )}

        {type === 'bar-scrollable' && (
          <ScrollableBarChart
            activePoint={activePoint}
            chart={charts[chartIndex]}
            charts={charts}
            currentChartIndex={currentChartIndex}
            height={height}
            labelsPosition={labelsPosition}
            width={width}
          />
        )}

        {type === 'line' && (
          <View>
            <LineChart
              charts={charts}
              currentChartIndex={currentChartIndex}
              currentTrend={currentTrend}
              height={height}
              labelsPosition={labelsPosition}
              previousChartIndex={previousChartIndex}
              previousTrend={previousTrend}
              transition={transition}
              width={width}
            >
              <View style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={onGestureEvent}>
                  <Animated.View style={StyleSheet.absoluteFill}>
                    <LineChartCursor
                      currentTrend={currentTrend}
                      height={height}
                      isCursorActive={isCursorActive}
                      translation={translation}
                      width={width}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </LineChart>
          </View>
        )}
      </Animated.View>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
        {charts.map((chart, index) => (
          <DataSetButton
            currentChartIndex={currentChartIndex}
            index={index}
            key={index}
            label={chart.label}
            onSelect={selectDataSet}
            transition={transition}
          />
        ))}
      </View>
    </View>
  );
}

export default Chart;
