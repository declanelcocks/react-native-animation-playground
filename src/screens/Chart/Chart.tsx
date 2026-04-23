import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { clamp, getYForX, useVector } from 'react-native-redash';

import CurrentPriceData from './_components/CurrentPrice';
import LineChart from './_components/LineChart';
import LineChartCursor from './_components/LineChartCursor';
import { hkQuote, oneDayTimeSlice, oneMonthTimeSlice } from './data';
import {
  buildCharts,
  FormattedItem,
  formatTimeSlice,
  X_MARGIN,
  Y_MARGIN,
} from './utils';

const height = 200;
const width = Dimensions.get('window').width - 32;
const type: 'candlestick' | 'line' = 'line';
const currentQuote = { ...hkQuote };
const data = [
  formatTimeSlice(oneDayTimeSlice, hkQuote, 'line'),
  formatTimeSlice(oneMonthTimeSlice, hkQuote, 'line'),
];

function Example() {
  const transition = useSharedValue(1);
  const isCursorActive = useSharedValue(false);
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);
  const quote = useSharedValue(currentQuote);
  // const currentPrice = useSharedValue<FormattedItem | null>(null);

  const { mainCharts: charts } = useMemo(
    () => buildCharts({ height, width }, data, type),
    [data, type],
  );

  const translation = useVector(
    width,
    charts[currentChartIndex.value].data.length > 0
      ? (getYForX(charts[currentChartIndex.value].path, width) ?? 0)
      : 0,
  ) as { x: SharedValue<number>; y: SharedValue<number> };

  const currentPrice = useSharedValue<FormattedItem | null>(
    charts[currentChartIndex.value].getItemAtX(width),
  );

  const chartDisplayProps = useAnimatedStyle(() => {
    return {
      display:
        charts[currentChartIndex.get()].data.length > 0 ? 'flex' : 'none',
    };
  });

  const previousTrend = useDerivedValue(() => {
    // use previousClose from quote for intraday
    const previousInitialClose =
      previousChartIndex.value === 0
        ? quote.get().previousClose
        : charts[previousChartIndex.get()]?.data?.[0]?.close;

    const previousChange =
      (quote.get().last ?? 0) - (previousInitialClose ?? 0);

    return previousChange >= 0 ? 'positive' : 'negative';
  });

  const currentTrend = useDerivedValue(() => {
    // use previousClose from quote for intraday
    const currentInitialClose =
      currentChartIndex.value === 0
        ? quote.get().previousClose
        : charts[currentChartIndex.get()]?.data?.[0]?.close;

    const currentChange = (quote.get().last ?? 0) - (currentInitialClose ?? 0);

    return currentChange >= 0 ? 'positive' : 'negative';
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
        (getYForX(charts[currentChartIndex.get()].path, translation.x.get()) ??
          0) + Y_MARGIN,
      );
      currentPrice.set(
        charts[currentChartIndex.get()].getItemAtX(translation.x.get()),
      );
    });

  return (
    <View style={{ padding: 16 }}>
      <CurrentPriceData
        chartIndex={currentChartIndex}
        charts={charts}
        chartType={type}
        currentPrice={currentPrice}
        isCursorActive={isCursorActive}
        quote={currentQuote}
      />

      <Animated.View style={chartDisplayProps}>
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
      </Animated.View>
    </View>
  );
}

export default Example;
