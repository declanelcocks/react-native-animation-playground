/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useCallback, useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { getYForX, useVector } from 'react-native-redash';

import QuoteSectionAnimated from './_components/QuoteSectionAnimated';
import TimeSliceButton from './_components/TimeSliceButton';
import { hkQuote, oneDayTimeSlice, oneMonthTimeSlice } from './data';
import { buildCharts, FormattedItem, formatTimeSlice } from './utils';

const height = 200;
const volumeChartHeight = 50;
const width = Dimensions.get('window').width - 32;
const type: 'candlestick' | 'line' = 'line';
const currentQuote = { ...hkQuote };
const data = [
  formatTimeSlice(
    {
      ...oneDayTimeSlice,
      historicalPrices: [
        oneDayTimeSlice.historicalPrices[0],
        oneDayTimeSlice.historicalPrices[1],
      ],
    },
    hkQuote,
    'line',
  ),
  formatTimeSlice(
    {
      ...oneMonthTimeSlice,
      historicalPrices: [
        oneMonthTimeSlice.historicalPrices[0],
        oneMonthTimeSlice.historicalPrices[1],
      ],
    },
    hkQuote,
    'line',
  ),
];

function Example() {
  const previousChartIndex = useSharedValue(0);
  const currentChartIndex = useSharedValue(0);
  const transition = useSharedValue(1);
  const currentPrice = useSharedValue<FormattedItem | null>(null);
  const isCursorActive = useSharedValue(false);
  // const quote = useSharedValue<null | Quote>(currentQuote);

  const { mainCharts: charts } = useMemo(
    () =>
      buildCharts(
        { height, volumeChartHeight, width },
        data,

        currentQuote.currencySymbol as any,
        type,
      ),
    [],
  );

  const translation = useVector(
    width,
    charts[currentChartIndex.get()].data.length > 0
      ? (getYForX(charts[currentChartIndex.get()].path, width) ?? 0)
      : 0,
  );

  currentPrice.set(charts[currentChartIndex.get()].getItemAtX(width));

  // this quote is used to generate the default line chart's color
  // useEffect(() => {
  //   quote.value = { ...currentQuote };
  // }, [currentQuote]);

  const updateTimeSlice = useCallback(
    (index: number) => {
      previousChartIndex.set(currentChartIndex.get());

      currentChartIndex.set(index);

      transition.set(0);
      transition.set(
        withTiming(1, {
          duration: 150,
        }),
      );

      if (charts[index]?.data?.length) {
        translation.x = width;

        translation.y = withTiming(getYForX(charts[index].path, width) ?? 0, {
          duration: 150,
        });

        currentPrice.set(charts[index].getItemAtX(width));
      } else {
        translation.x = width;
        translation.y = 0;

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
    <View>
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
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default Example;
