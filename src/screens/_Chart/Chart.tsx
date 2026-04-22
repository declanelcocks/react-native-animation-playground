/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { clamp, getYForX, useVector } from 'react-native-redash';

import CandlestickChart from './_components/CandlestickChart';
import CandlestickChartCursor from './_components/CandlestickChartCursor';
import ChartLabel from './_components/ChartLabel';
import LineChart from './_components/LineChart';
import LineChartCursor from './_components/LineChartCursor';
import QuoteSectionAnimated from './_components/QuoteSectionAnimated';
import TimeSliceButton from './_components/TimeSliceButton';
import VolumeChart from './_components/VolumeChart';
import { hkQuote, timeSlice } from './data';
import { buildCharts, FormattedItem, formatTimeSlice, Y_MARGIN } from './utils';

const height = 200;
const volumeChartHeight = 50;
const width = Dimensions.get('window').width - 32;
const type: 'candlestick' | 'line' = 'line';
const currentQuote = { ...hkQuote };
const data = [
  formatTimeSlice(
    {
      ...timeSlice,
      historicalPrices: [
        timeSlice.historicalPrices[0],
        timeSlice.historicalPrices[1],
      ],
    },
    hkQuote,
    'line',
  ),
];

function Example() {
  const translation = useVector(0);
  const transition = useSharedValue(1);
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);
  const currentPrice = useSharedValue<FormattedItem | null>(null);
  const isCursorActive = useSharedValue(false);
  const quote = useSharedValue(null);

  const { mainCharts: charts } = useMemo(
    () =>
      buildCharts(
        { height, volumeChartHeight, width },
        data,

        currentQuote.currencySymbol as any,
        type,
      ),
    [data, type],
  );

  translation.x.value = width;

  translation.y.value =
    (charts[currentChartIndex.value].data.length > 0 &&
      getYForX(charts[currentChartIndex.value].path, width)) ??
    0;

  currentPrice.value = charts[currentChartIndex.value].getItemAtX(width);

  const updateTimeSlice = useCallback(
    (index: number) => {
      previousChartIndex.value = currentChartIndex.value;

      currentChartIndex.value = index;

      transition.value = 0;
      transition.value = withTiming(1, {
        duration: 150,
      });

      if (charts[index]?.data?.length) {
        translation.x.value = width;

        translation.y.value = withTiming(getYForX(charts[index].path, width), {
          duration: 150,
        });

        currentPrice.value = charts[index].getItemAtX(width);
      } else {
        translation.x.value = width;
        translation.y.value = 0;

        currentPrice.value = null;
      }
    },
    [
      charts,
      currentPrice,
      currentChartIndex,
      previousChartIndex,
      transition,
      translation,
      width,
    ],
  );

  // this quote is used to generate the default line chart's color
  useEffect(() => {
    quote.value = { ...currentQuote };
  }, [currentQuote]);

  const currentTrend = useDerivedValue(() => {
    // use previousClose from quote for intraday
    const currentInitialClose =
      currentChartIndex.value === 0
        ? quote.value?.previousClose
        : charts[currentChartIndex.value]?.data?.[0]?.close;

    const currentChange =
      Number(quote.value?.last ?? 0) - Number(currentInitialClose ?? 0);

    return currentChange >= 0 ? 'positive' : 'negative';
  });

  const previousTrend = useDerivedValue(() => {
    // use previousClose from quote for intraday
    const previousInitialClose =
      previousChartIndex.value === 0
        ? quote.value?.previousClose
        : charts[previousChartIndex.value]?.data?.[0]?.close;

    const previousChange =
      Number(quote.value?.last ?? 0) - Number(previousInitialClose ?? 0);

    return previousChange >= 0 ? 'positive' : 'negative';
  });

  const onGestureEvent = Gesture.Pan()
    .activeOffsetX([0, 0])
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onUpdate(({ x }) => {
      if (x < 0) return;
      isCursorActive.value = true;
      translation.x.value = Math.min(x, width);
      translation.y.value =
        getYForX(charts[currentChartIndex.value].path, translation.x.value) +
        Y_MARGIN;
      currentPrice.value = charts[currentChartIndex.value].getItemAtX(
        translation.x.value,
      );
    })
    .onEnd(() => {
      isCursorActive.value = false;
      translation.x.value = width;
      translation.y.value =
        getYForX(charts[currentChartIndex.value].path, translation.x.value) +
        Y_MARGIN;
      currentPrice.value = charts[currentChartIndex.value].getItemAtX(
        translation.x.value,
      );
    });

  // const onGestureEvent = useAnimatedGestureHandler({
  //   onActive: ({ x }) => {
  //     if (x < 0) return;
  //     isCursorActive.value = true;
  //     translation.x.value = Math.min(x, width);
  //     translation.y.value =
  //       getYForX(charts[currentChartIndex.value].path, translation.x.value) +
  //       Y_MARGIN;
  //     currentPrice.value = charts[currentChartIndex.value].getItemAtX(
  //       translation.x.value,
  //     );
  //   },
  //   onEnd: () => {
  //     isCursorActive.value = false;
  //     translation.x.value = width;
  //     translation.y.value =
  //       getYForX(charts[currentChartIndex.value].path, translation.x.value) +
  //       Y_MARGIN;
  //     currentPrice.value = charts[currentChartIndex.value].getItemAtX(
  //       translation.x.value,
  //     );
  //   },
  // });

  const onClampedGestureEvent = Gesture.Pan()
    .activeOffsetX([0, 0])
    .activeOffsetY([0, 0])
    .minDistance(0)
    .onUpdate(({ x, y }) => {
      if (x >= 0 && x <= width) {
        const step = width / charts[currentChartIndex.value].data.length;

        isCursorActive.value = true;

        const xVal = clamp(x - (x % step) + step / 2, 0, width - step / 2);

        translation.x.value = xVal;
        translation.y.value = clamp(y, 0, height) || 0;

        currentPrice.value =
          charts[currentChartIndex.value].data[Math.floor(xVal / step)];
      }
    })
    .onEnd(() => {
      const step = width / charts[currentChartIndex.value].data.length;

      isCursorActive.value = false;

      const xVal = clamp(
        width - (width % step) + step / 2,
        0,
        width - step / 2,
      );

      translation.x.value = xVal;
      translation.y.value = getYForX(
        charts[currentChartIndex.value].path,
        xVal,
      );

      currentPrice.value =
        charts[currentChartIndex.value].data[Math.floor(xVal / step)];
    });

  // const onClampedGestureEvent = useAnimatedGestureHandler({
  //   onActive: ({ x, y }) => {
  //     if (x >= 0 && x <= width) {
  //       const step = width / charts[currentChartIndex.value].data.length;

  //       isCursorActive.value = true;

  //       const xVal = clamp(x - (x % step) + step / 2, 0, width - step / 2);

  //       translation.x.value = xVal;
  //       translation.y.value = clamp(y, 0, height) || 0;

  //       currentPrice.value =
  //         charts[currentChartIndex.value].data[Math.floor(xVal / step)];
  //     }
  //   },
  //   onEnd: () => {
  //     const step = width / charts[currentChartIndex.value].data.length;

  //     isCursorActive.value = false;

  //     const xVal = clamp(
  //       width - (width % step) + step / 2,
  //       0,
  //       width - step / 2,
  //     );

  //     translation.x.value = xVal;
  //     translation.y.value = getYForX(
  //       charts[currentChartIndex.value].path,
  //       xVal,
  //     );

  //     currentPrice.value =
  //       charts[currentChartIndex.value].data[Math.floor(xVal / step)];
  //   },
  // });

  const chartDisplayProps = useAnimatedStyle(() => {
    return {
      display:
        charts[currentChartIndex.value].data.length > 0 ? 'flex' : 'none',
    };
  });

  const emptyMessageDisplayProps = useAnimatedStyle(() => {
    return {
      display:
        charts[currentChartIndex.value].data.length > 0 ? 'none' : 'flex',
    };
  });

  return (
    <>
      <View
        {...(Dimensions.get('window').height >= 1024 && { paddingTop: 16 })}
      >
        <QuoteSectionAnimated
          chartIndex={currentChartIndex}
          charts={charts}
          chartType={type}
          currentPrice={currentPrice}
          isCursorActive={isCursorActive}
          quote={currentQuote}
        />
      </View>
      <View style={{ padding: 16 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 4,
          }}
        >
          {charts.map((chart, index) => (
            <TimeSliceButton
              currentIndex={currentChartIndex}
              index={index}
              key={chart.timeSliceLabel}
              onPress={updateTimeSlice}
              text={chart.timeSliceLabel}
              variant="solid"
            />
          ))}
        </View>

        <Animated.View style={emptyMessageDisplayProps}>
          <View
            style={{
              alignItems: 'center',
              height: 220,
              justifyContent: 'center',
            }}
          >
            <Text>Not enough data</Text>
          </View>
        </Animated.View>

        <Animated.View style={chartDisplayProps}>
          {type === 'candlestick' && (
            <View>
              <ChartLabel
                charts={charts}
                currentChartIndex={currentChartIndex}
                quote={currentQuote}
              />
              <CandlestickChart
                charts={charts}
                currentChartIndex={currentChartIndex}
                height={height}
                width={width}
              >
                <View style={StyleSheet.absoluteFill}>
                  {/* <PanGestureHandler
                    {...{ onGestureEvent: onClampedGestureEvent }}
                    activeOffsetX={[0, 0]}
                    activeOffsetY={[0, 0]}
                    minDist={0}
                  > */}
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
                  {/* </PanGestureHandler> */}
                </View>
              </CandlestickChart>
            </View>
          )}

          {type === 'line' && (
            <View>
              <ChartLabel
                charts={charts}
                currentChartIndex={currentChartIndex}
                quote={currentQuote}
              />
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
                  {/* <PanGestureHandler
                    {...{ onGestureEvent }}
                    activeOffsetX={[0, 0]}
                    activeOffsetY={[0, 0]}
                    minDist={0}
                  > */}
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
                  {/* </PanGestureHandler> */}
                </View>
              </LineChart>
            </View>
          )}

          <VolumeChart
            charts={charts}
            currentChartIndex={currentChartIndex}
            currentPrice={currentPrice}
            height={volumeChartHeight}
            isCursorActive={isCursorActive}
            width={width}
          />
        </Animated.View>
      </View>
    </>
  );
}

export default Example;
