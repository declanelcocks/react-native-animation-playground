import { useCallback, useEffect, useMemo } from 'react';
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

import BarChart from './_components/BarChart';
import CandlestickChart from './_components/CandlestickChart';
import CandlestickChartCursor from './_components/CandlestickChartCursor';
import CurrentPriceData from './_components/CurrentPriceData';
import LineChart from './_components/LineChart';
import LineChartCursor from './_components/LineChartCursor';
import TimeSliceButton from './_components/TimeSliceButton';
import { Y_AXIS_LABELS_WIDTH } from './_components/YAxisLabels';
import { TimeSlice } from './types';
import { buildCharts, FormattedItemWithIndex, Y_MARGIN } from './utils';
interface ChartProps {
  data: TimeSlice[];
  height: number;
  labelsPosition?: 'left' | 'right';
  type: 'bar' | 'candlestick' | 'line';
  width: number;
}

function Example({ data, height, labelsPosition, type, width }: ChartProps) {
  const transition = useSharedValue(1);
  const isCursorActive = useSharedValue(false);
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);

  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const rightOffset = labelsPosition === 'right' ? Y_AXIS_LABELS_WIDTH : 0;
  const lineChartEndX = width - rightOffset;

  const { mainCharts: charts } = useMemo(
    () => buildCharts({ height, width }, data, type, labelsPosition),
    [data, type, height, width, labelsPosition],
  );

  const translation = useVector() as {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };

  const currentPrice = useSharedValue<FormattedItemWithIndex | null>(null);

  useEffect(() => {
    if (type === 'line') {
      translation.x.set(lineChartEndX);
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, lineChartEndX) ?? 0) +
          Y_MARGIN,
      );
      currentPrice.set(
        charts[currentChartIndex.get()].getItemAtX(lineChartEndX),
      );
    } else {
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.get()].data.length;
      const candlestickEndX = leftOffset + candlestickChartWidth - step / 2;

      const xVal = clamp(
        candlestickEndX,
        leftOffset + step / 2,
        candlestickEndX,
      );

      const dataPointIndex = Math.floor((xVal - leftOffset) / step);

      const dataPoint = charts[currentChartIndex.get()].data[dataPointIndex];

      translation.x.set(xVal);
      translation.y.set(0);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    }
  }, [
    charts,
    currentChartIndex,
    currentPrice,
    leftOffset,
    lineChartEndX,
    translation.x,
    translation.y,
    type,
    width,
  ]);

  const chartDisplayProps = useAnimatedStyle(() => {
    return {
      display:
        charts[currentChartIndex.get()].data.length > 0 ? 'flex' : 'none',
    };
  });

  const previousTrend = useDerivedValue(() => {
    const chartData = charts[previousChartIndex.get()]?.data;
    const firstClose = chartData[0]?.close;
    const lastClose = chartData[chartData.length - 1]?.close;
    if (firstClose == null || lastClose == null) return 'positive';
    return lastClose >= firstClose ? 'positive' : 'negative';
  });

  const currentTrend = useDerivedValue(() => {
    const chartData = charts[currentChartIndex.get()]?.data;
    const firstClose = chartData[0]?.close;
    const lastClose = chartData[chartData.length - 1]?.close;
    if (firstClose == null || lastClose == null) return 'positive';
    return lastClose >= firstClose ? 'positive' : 'negative';
  });

  const onGestureEvent = Gesture.Pan()
    .activeOffsetX(32)
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onBegin(({ x }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      translation.x.set(clamp(x, leftOffset, lineChartEndX));
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, translation.x.get()) ??
          0) + Y_MARGIN,
      );
      currentPrice.set(
        charts[currentChartIndex.get()].getItemAtX(translation.x.get()),
      );
    })
    .onUpdate(({ x }) => {
      if (x < 0) return;
      isCursorActive.set(true);
      translation.x.set(clamp(x, leftOffset, lineChartEndX));
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, translation.x.get()) ??
          0) + Y_MARGIN,
      );
      currentPrice.set(
        charts[currentChartIndex.get()].getItemAtX(translation.x.get()),
      );
    })
    .onFinalize(() => {
      isCursorActive.set(false);
      translation.x.set(lineChartEndX);
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, lineChartEndX) ?? 0) +
          Y_MARGIN,
      );
      currentPrice.set(
        charts[currentChartIndex.get()].getItemAtX(lineChartEndX),
      );
    });

  const onClampedGestureEvent = Gesture.Pan()
    .activeOffsetX(32)
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onBegin(({ x, y }) => {
      if (x < 0) return;
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.value].data.length;
      const candlestickEndX = leftOffset + candlestickChartWidth - step / 2;

      isCursorActive.set(true);

      const xVal = clamp(
        x - (x % step) + step / 2,
        leftOffset + step / 2,
        candlestickEndX,
      );

      const dataPointIndex = Math.floor((xVal - leftOffset) / step);

      const dataPoint = charts[currentChartIndex.value].data[dataPointIndex];

      translation.x.set(xVal);
      translation.y.set(clamp(y, 0, height) || 0);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    })
    .onUpdate(({ x, y }) => {
      if (x < 0) return;
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.value].data.length;
      const candlestickEndX = leftOffset + candlestickChartWidth - step / 2;

      isCursorActive.set(true);

      const xVal = clamp(
        x - (x % step) + step / 2,
        leftOffset + step / 2,
        candlestickEndX,
      );

      const dataPointIndex = Math.floor((xVal - leftOffset) / step);

      const dataPoint = charts[currentChartIndex.value].data[dataPointIndex];

      translation.x.set(xVal);
      translation.y.set(clamp(y, 0, height) || 0);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    })
    .onFinalize(() => {
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.get()].data.length;
      const candlestickEndX = leftOffset + candlestickChartWidth - step / 2;

      isCursorActive.set(false);

      const xVal = clamp(
        candlestickEndX,
        leftOffset + step / 2,
        candlestickEndX,
      );

      const dataPointIndex = Math.floor((xVal - leftOffset) / step);

      const dataPoint = charts[currentChartIndex.get()].data[dataPointIndex];

      translation.x.set(xVal);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    });

  const updateTimeSlice = useCallback(
    (index: number) => {
      if (index === currentChartIndex.get()) return;

      previousChartIndex.set(currentChartIndex.get());

      currentChartIndex.set(index);

      transition.set(0);
      transition.set(
        withTiming(1, {
          duration: 150,
        }),
      );

      if (charts[index]?.data?.length) {
        translation.x.set(lineChartEndX);

        translation.y.set(
          withTiming(
            (getYForX(
              charts[currentChartIndex.get()].path,
              translation.x.get(),
            ) ?? 0) + Y_MARGIN,
            {
              duration: 150,
            },
          ),
        );

        currentPrice.set(charts[index].getItemAtX(lineChartEndX));
      } else {
        translation.x.set(lineChartEndX);
        translation.y.set(0);

        currentPrice.set(null);
      }
    },
    [
      currentChartIndex,
      previousChartIndex,
      transition,
      charts,
      translation.x,
      translation.y,
      lineChartEndX,
      currentPrice,
    ],
  );

  return (
    <View style={{ padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <CurrentPriceData
          chartIndex={currentChartIndex}
          charts={charts}
          currentPrice={currentPrice}
        />
      </View>

      <Animated.View style={chartDisplayProps}>
        {type === 'candlestick' && (
          <View>
            <CandlestickChart
              charts={charts}
              currentChartIndex={currentChartIndex}
              currentPrice={currentPrice}
              height={height}
              labelsPosition={labelsPosition}
              width={width}
            >
              <View style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={onClampedGestureEvent}>
                  <Animated.View style={StyleSheet.absoluteFill}>
                    <CandlestickChartCursor
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
              charts={charts}
              currentChartIndex={currentChartIndex}
              currentPrice={currentPrice}
              height={height}
              labelsPosition={labelsPosition}
              width={width}
            >
              <View style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={onClampedGestureEvent}>
                  <Animated.View style={StyleSheet.absoluteFill}>
                    <CandlestickChartCursor
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
          <TimeSliceButton
            currentChartIndex={currentChartIndex}
            key={index}
            onChangeTimeSlice={updateTimeSlice}
            timeSliceIndex={index}
            timeSliceLabel={chart.dateRangeLabel}
            transition={transition}
          />
        ))}
      </View>
    </View>
  );
}

export default Example;
