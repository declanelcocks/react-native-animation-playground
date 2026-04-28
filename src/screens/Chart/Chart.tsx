import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { clamp, getYForX, useVector } from 'react-native-redash';

import CandlestickChart from './_components/CandlestickChart';
import CandlestickChartCursor from './_components/CandlestickChartCursor';
import CurrentPriceData from './_components/CurrentPriceData';
import LineChart from './_components/LineChart';
import LineChartCursor from './_components/LineChartCursor';
import TimeSliceButton from './_components/TimeSliceButton';
import { Y_AXIS_LABELS_WIDTH } from './_components/YAxisLabels';
import { oneDayTimeSlice, oneMonthTimeSlice } from './data';
import {
  buildCharts,
  FormattedItemWithIndex,
  X_MARGIN,
  Y_MARGIN,
} from './utils';

const height = 200;
const width = Dimensions.get('window').width - 32;
const data = [oneDayTimeSlice, oneMonthTimeSlice];

function Example() {
  const [type, setType] = useState<'candlestick' | 'line'>('candlestick');
  const transition = useSharedValue(1);
  const isCursorActive = useSharedValue(false);
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);

  const { mainCharts: charts } = useMemo(
    () => buildCharts({ height, width }, data, type),
    [data, type],
  );

  // const translation = useVector(
  //   width,
  //   charts[currentChartIndex.get()].data.length > 0
  //     ? (getYForX(charts[currentChartIndex.get()].path, width) ?? 0) + Y_MARGIN
  //     : 0,
  // ) as { x: SharedValue<number>; y: SharedValue<number> };

  // const currentPrice = useSharedValue<FormattedItem | null>(
  //   charts[currentChartIndex.get()].getItemAtX(width),
  // );
  const translation = useVector() as {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };

  const currentPrice = useSharedValue<FormattedItemWithIndex | null>(null);

  useEffect(() => {
    if (type === 'line') {
      translation.x.set(width);
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, width) ?? 0) + Y_MARGIN,
      );
      currentPrice.set(charts[currentChartIndex.get()].getItemAtX(width));
    } else {
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.get()].data.length;

      const xVal = clamp(
        width - (width % step) + step / 2,
        Y_AXIS_LABELS_WIDTH + step / 2,
        width - step / 2,
      );

      const dataPointIndex = Math.floor((xVal - Y_AXIS_LABELS_WIDTH) / step);

      const dataPoint = charts[currentChartIndex.get()].data[dataPointIndex];

      translation.x.set(xVal);
      translation.y.set(0);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    }
  }, [type]);

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
      translation.x.set(clamp(x, X_MARGIN, width));
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
      translation.x.set(clamp(x, X_MARGIN, width));
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
      translation.x.set(width);
      translation.y.set(
        (getYForX(charts[currentChartIndex.get()].path, width) ?? 0) + Y_MARGIN,
      );
      currentPrice.set(charts[currentChartIndex.get()].getItemAtX(width));
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

      isCursorActive.set(true);

      const xVal = clamp(
        x - (x % step) + step / 2,
        Y_AXIS_LABELS_WIDTH + step / 2,
        width - step / 2,
      );

      const dataPointIndex = Math.floor((xVal - Y_AXIS_LABELS_WIDTH) / step);

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

      isCursorActive.set(true);

      const xVal = clamp(
        x - (x % step) + step / 2,
        Y_AXIS_LABELS_WIDTH + step / 2,
        width - step / 2,
      );

      const dataPointIndex = Math.floor((xVal - Y_AXIS_LABELS_WIDTH) / step);

      const dataPoint = charts[currentChartIndex.value].data[dataPointIndex];

      translation.x.set(xVal);
      translation.y.set(clamp(y, 0, height) || 0);
      currentPrice.set({ ...dataPoint, index: dataPointIndex });
    })
    .onFinalize(() => {
      const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;
      const step =
        candlestickChartWidth / charts[currentChartIndex.get()].data.length;

      isCursorActive.set(false);

      const xVal = clamp(
        width - (width % step) + step / 2,
        Y_AXIS_LABELS_WIDTH + step / 2,
        width - step / 2,
      );

      const dataPointIndex = Math.floor((xVal - Y_AXIS_LABELS_WIDTH) / step);

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
        translation.x.set(width);

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

        currentPrice.set(charts[index].getItemAtX(width));
      } else {
        translation.x.set(width);
        translation.y.set(0);

        currentPrice.set(null);
      }
    },
    [
      charts,
      currentPrice,
      currentChartIndex,
      previousChartIndex,
      transition,
      translation,
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

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
        <Button
          onPress={() => {
            setType('line');
          }}
          title="Line"
        />
        <Button
          onPress={() => {
            setType('candlestick');
          }}
          title="Candle"
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

        {type === 'line' && (
          <View>
            <LineChart
              charts={charts}
              currentChartIndex={currentChartIndex}
              currentTrend={currentTrend}
              height={height}
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
