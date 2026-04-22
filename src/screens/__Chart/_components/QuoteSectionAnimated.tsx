import { Platform, Text, View } from 'react-native';
import {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Quote } from '../types';
import {
  Chart,
  ChartType,
  formatPrice,
  FormattedItem,
  pct,
  round,
} from '../utils';
import CoreQuoteSection from './CoreQuoteSection';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: Chart[];
  chartType: ChartType;
  coreQuote?: Quote;
  currentPrice: SharedValue<FormattedItem | null>;
  isCursorActive: SharedValue<boolean>;
  overflowCoreQuote?: boolean;
  quote?: Quote;
}

function QuoteSectionAnimated({
  chartIndex,
  charts,
  chartType,
  coreQuote,
  currentPrice,
  isCursorActive,
  overflowCoreQuote,
  quote,
}: Props) {
  const theme = useTheme();

  const realTimeQuoteMsg = 'quote-update-real-time';
  const delayedQuoteMsg = 'quote-update-delay-time';
  const closingPriceMsg = 'chart-closing-price';
  const comma = ',';
  const {
    currencySymbol: quoteCurrencySymbol,
    isRealTime: quoteIsRealTime,
    last: quoteLastPrice,
    previousClose: quotePreviousClose,
  } = quote ?? {};

  const lastPrice = useDerivedValue(() => {
    const showQuote =
      !isCursorActive.value && typeof quoteLastPrice === 'number';

    return round(
      showQuote ? quoteLastPrice : currentPrice.value?.close,
      currentPrice.value?.currencySymbol === 'HKD' ||
        quoteCurrencySymbol === 'HKD'
        ? 3
        : 2,
    );
  });

  const open = useDerivedValue(() => {
    return round(
      currentPrice.value?.open,
      currentPrice.value?.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const close = useDerivedValue(() => {
    return round(
      currentPrice.value?.close,
      currentPrice.value?.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const high = useDerivedValue(() => {
    return round(
      currentPrice.value?.high,
      currentPrice.value?.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const low = useDerivedValue(() => {
    return round(
      currentPrice.value?.low,
      currentPrice.value?.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const volume = useDerivedValue(() => {
    return round(currentPrice.value?.volume, 0, true);
  });

  /**
   * When showing quote on line chart, use quote and first data point of chart
   * to calculate change. In intraday link charts use previous close instead.
   *
   * Otherwise use change/changeRatio from currentPrice.
   */
  const changeValues = useDerivedValue(() => {
    let change: string;
    let changeRatio: null | number;

    if (chartType === 'line' && !isCursorActive.value) {
      const initialClose =
        chartIndex.value === 0
          ? quotePreviousClose
          : charts[chartIndex.value]?.data?.[0]?.close;
      const timeSliceChange =
        initialClose != null && quoteLastPrice != null
          ? quoteLastPrice - initialClose
          : null;
      const timeSliceChangeRatio =
        initialClose && initialClose !== 0 && timeSliceChange !== null
          ? timeSliceChange / initialClose
          : null;

      change = round(timeSliceChange, quoteCurrencySymbol === 'HKD' ? 3 : 2);
      changeRatio = timeSliceChangeRatio;
    } else {
      change = round(
        currentPrice.value?.change,
        currentPrice.value?.currencySymbol === 'HKD' ? 3 : 2,
      );
      changeRatio = Number(currentPrice.value?.changeRatio);
    }

    return { change, changeRatio };
  });

  /**
   * When showing quote on line chart, use currentTrend which considers
   * quote and first data point.
   * Otherwise use currentPrice?.value?.change from backend
   */
  const changeStyle = useAnimatedStyle(() => {
    let color;

    if (chartType === 'line' && !isCursorActive.value) {
      color =
        changeValues.value.changeRatio != null &&
        changeValues.value.changeRatio >= 0
          ? theme.colors.green500
          : theme.colors.red500;
    } else {
      color =
        Number(currentPrice.value?.change) >= 0
          ? theme.colors.green500
          : theme.colors.red500;
    }

    return {
      color,
    };
  });

  const changeText = useDerivedValue(() => {
    return `${changeValues.value.change} (${pct(
      changeValues.value.changeRatio,
    )})`;
  });

  const dateRange = useDerivedValue(() => {
    return charts[chartIndex.value]?.dateRangeLabel || '';
  });

  const quoteLastDate = useDerivedValue(() => {
    if (!quote?.date) return;

    const date = new Date(quote.date);
    const dateString = date.toLocaleDateString('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeString = date.toLocaleTimeString('en', {
      hour: 'numeric',
      minute: 'numeric',
    });

    const result = `${
      quoteIsRealTime ? realTimeQuoteMsg : delayedQuoteMsg
    }${dateString}${comma}${timeString}`;

    return result;
  });

  const dateLabel = useDerivedValue(() => {
    if (!isCursorActive.value && chartType === 'line')
      return quoteLastDate.value;

    const currentPriceDate = currentPrice.get()?.date;

    if (!currentPriceDate || currentPrice.get()?.isMockData) return '';

    const date = new Date(currentPriceDate);

    let relativeDateTimeLabel;

    if (chartIndex.value === 0) {
      const dateString = date.toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeString = date.toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric',
      });
      relativeDateTimeLabel = `${dateString}${comma}${timeString}`;
    } else if (chartIndex.value === 1 || chartIndex.value === 2) {
      relativeDateTimeLabel = date.toLocaleString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } else {
      relativeDateTimeLabel = date.toLocaleString('en', {
        month: 'short',
        year: 'numeric',
      });
    }

    const messages = {
      close: `${closingPriceMsg}${relativeDateTimeLabel}`, // chart-closing-price
      delayed: `${delayedQuoteMsg}${relativeDateTimeLabel}`, // quote-update-delay-time
      realtime: `${realTimeQuoteMsg}${relativeDateTimeLabel}`, // quote-update-real-time
    };

    let result = '';
    const quoteType = currentPrice.get()?.quoteType;

    if (isCursorActive.value && !!quoteType) {
      result = messages[quoteType];
    } else if (chartType === 'candlestick' && relativeDateTimeLabel) {
      result = messages.close;
    }

    return result;
  });

  const height = coreQuote ? 155 : 130; // so that chart segments appear at the same place on candle and line views

  return (
    <>
      {chartType === 'candlestick' && (
        <View
          style={{
            alignItems: 'center',
            height: height,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>open</Text>
              <Label text={open} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>close</Text>
              <Label text={close} />
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>high</Text>
              <Label text={high} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>low</Text>
              <Label text={low} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>volume</Text>
              <Label text={volume} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>change</Text>
              <Label style={changeStyle} text={changeText} />
            </View>
          </View>

          <Label style={{ textAlign: 'center' }} text={dateLabel as any} />
        </View>
      )}

      {chartType === 'line' && (
        <View
          style={{
            alignItems: 'center',
            height: height,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
          >
            {/* Bid */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text
                style={{ color: theme.colors.purple50, fontWeight: 'bold' }}
              >
                bid
              </Text>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text>
                  {formatPrice(quote?.bid, quote?.currencySymbol, null, true)}
                </Text>
              </View>
            </View>

            {/* Price + change */}
            <View style={{ alignItems: 'center', flex: 2 }}>
              <Label
                style={{
                  // Fixes an issue on iPad where half of the number is cropped
                  height: 'auto',
                  lineHeight: Platform.OS === 'ios' ? 0 : undefined,
                }}
                text={lastPrice}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Label style={changeStyle} text={changeText} />
                <Label text={dateRange} />
              </View>
            </View>

            {/* Ask */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text
                style={{ color: theme.colors.purple50, fontWeight: 'bold' }}
              >
                ask
              </Text>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text>
                  {formatPrice(quote?.ask, quote?.currencySymbol, null, true)}
                </Text>
              </View>
            </View>
          </View>
          <Label text={dateLabel as any} />
          <CoreQuoteSection overflow={overflowCoreQuote} quote={coreQuote} />
        </View>
      )}
    </>
  );
}

export default QuoteSectionAnimated;
