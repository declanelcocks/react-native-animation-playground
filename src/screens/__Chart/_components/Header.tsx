import dayjs from 'dayjs';
import { Platform, Text, View } from 'react-native';
import {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Quote } from '../types';
import { Chart, ChartType, FormattedItem, pct, round } from '../utils';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: Chart[];
  chartType: ChartType;
  currentPrice: SharedValue<FormattedItem>;
  currentTrend: Readonly<SharedValue<'negative' | 'positive'>>;
  isCursorActive: SharedValue<boolean>;
  quote?: Quote;
}

export function Header({
  chartIndex,
  charts,
  chartType,
  currentPrice,
  currentTrend,
  isCursorActive,
  quote,
}: Props) {
  const theme = useTheme();

  const realTimeQuoteMsg = 'quote-update-real-time';
  const delayedQuoteMsg = 'quote-update-delay-time';
  const closingPriceMsg = 'chart-closing-price';

  const {
    currencySymbol: quoteCurrencySymbol,
    isRealTime: quoteIsRealTime,
    last: quoteLastPrice,
    previousClose: quotePreviousClose,
  } = quote ?? {};
  const quoteLastDate = quote?.date
    ? dayjs(quote.date).format('DD-MM-YYYY HH:mm')
    : null;

  const lastPrice = useDerivedValue(() => {
    const showQuote = !isCursorActive.value && quoteLastPrice;
    return round(
      showQuote ? quoteLastPrice : currentPrice.value.close,
      currentPrice.value.currencySymbol === 'HKD' ||
        quoteCurrencySymbol === 'HKD'
        ? 3
        : 2,
    );
  });

  const open = useDerivedValue(() => {
    return round(
      currentPrice.value.open,
      currentPrice.value.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const close = useDerivedValue(() => {
    return round(
      currentPrice.value.close,
      currentPrice.value.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const high = useDerivedValue(() => {
    return round(
      currentPrice.value.high,
      currentPrice.value.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const low = useDerivedValue(() => {
    return round(
      currentPrice.value.low,
      currentPrice.value.currencySymbol === 'HKD' ? 3 : 2,
    );
  });

  const volume = useDerivedValue(() => {
    return round(currentPrice.value.volume, 6, true);
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
        currentTrend.value === 'positive'
          ? theme.colors.green500
          : theme.colors.red500;
    } else {
      color =
        Number(currentPrice.value.change) >= 0
          ? theme.colors.green500
          : theme.colors.red500;
    }

    return {
      color,
    };
  }, [chartType]);

  /**
   * When showing quote on line chart, use quote and first data point of chart
   * to calculate change.
   * Otherwise use change/changeRatio from backend
   */
  const change = useDerivedValue(() => {
    let change;
    let changeRatio;

    if (chartType === 'line' && !isCursorActive.value) {
      const initialClose =
        chartIndex.value === 0
          ? quotePreviousClose
          : charts[chartIndex.value]?.data?.[0]?.close;
      const timeSliceChange = (quoteLastPrice ?? 0) - (initialClose ?? 0);
      const timeSliceChangeRatio = timeSliceChange
        ? timeSliceChange / (initialClose ?? 0)
        : 0;

      change = round(timeSliceChange, quoteCurrencySymbol === 'HKD' ? 3 : 2);
      changeRatio = `${pct(timeSliceChangeRatio)}`;
    } else {
      change = round(
        currentPrice.value.change,
        currentPrice.value.currencySymbol === 'HKD' ? 3 : 2,
      );
      changeRatio = `${pct(currentPrice.value.changeRatio)}`;
    }

    return `${change} (${changeRatio})`;
  }, [chartType]);

  const dateRange = useDerivedValue(() => {
    return charts[chartIndex.value].dateRangeLabel;
  });

  const dateLabel = useDerivedValue(() => {
    if (currentPrice.value.isMockData) {
      return '';
    }

    const messages = {
      close: `${closingPriceMsg}${currentPrice.value.relativeDateTimeLabel}`, // chart-closing-price
      delayed: `${delayedQuoteMsg}${currentPrice.value.relativeDateTimeLabel}`, // quote-update-delay-time
      realtime: `${realTimeQuoteMsg}${currentPrice.value.relativeDateTimeLabel}`, // quote-update-real-time
    };

    let result = '-';

    if (isCursorActive.value && currentPrice.value.quoteType) {
      result = messages[currentPrice.value.quoteType];
    } else if (chartType === 'candlestick') {
      result = messages.close;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (chartType === 'line' && quoteLastDate) {
      result = `${
        quoteIsRealTime ? realTimeQuoteMsg : delayedQuoteMsg
      } ${quoteLastDate}`;
    }

    return result;
  });

  return (
    <View style={{ marginBottom: 8 }}>
      {chartType === 'candlestick' && (
        <>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>open</Text>
              <Label style={{ fontSize: 10 }} text={open} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>close</Text>
              <Label style={{ fontSize: 10 }} text={close} />
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>high</Text>
              <Label style={{ fontSize: 10 }} text={high} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>low</Text>
              <Label style={{ fontSize: 10 }} text={low} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 10 }}>volume</Text>
              <Label style={{ fontSize: 10 }} text={volume} />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 10 }}>change</Text>
              <Label style={{ fontSize: 10 }} text={change} />
            </View>
          </View>

          <Label
            style={{ fontSize: 10, textAlign: 'center' }}
            text={dateLabel}
          />
        </>
      )}

      {chartType === 'line' && (
        <>
          <Label
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              // Fixes an issue on iPad where half of the number is cropped
              lineHeight: Platform.OS === 'ios' ? 0 : undefined,
              textAlign: 'left',
            }}
            text={lastPrice}
          />

          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
              marginVertical: 4,
            }}
          >
            <Label
              style={[
                { fontSize: 10, fontWeight: 'bold', textAlign: 'left' },
                changeStyle,
              ]}
              text={change}
            />

            <Label
              style={{ fontSize: 10, textAlign: 'left' }}
              text={dateRange}
            />
          </View>

          <Label style={{ fontSize: 10, textAlign: 'left' }} text={dateLabel} />

          <View style={{ marginBottom: 8 }} />
        </>
      )}
    </View>
  );
}

export default Header;
