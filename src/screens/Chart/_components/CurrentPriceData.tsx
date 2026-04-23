import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { round } from '../formatters';
import { Quote } from '../types';
import { Chart, ChartType, FormattedItem } from '../utils';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: Chart[];
  chartType: ChartType;
  currentPrice: SharedValue<FormattedItem | null>;
  isCursorActive: SharedValue<boolean>;
  quote?: Quote;
}

export function CurrentPriceData({
  chartIndex,
  charts,
  chartType,
  currentPrice,
  isCursorActive,
  quote,
}: Props) {
  const dateTimeSeparator = ' @ ';
  const { last: quoteLastPrice } = quote ?? {};

  const lastPrice = useDerivedValue(() => {
    const showQuote =
      !isCursorActive.get() && typeof quoteLastPrice === 'number';

    return round(showQuote ? quoteLastPrice : currentPrice.get()?.close, 2);
  });

  const dateRange = useDerivedValue(() => {
    return charts[chartIndex.get()]?.dateRangeLabel || '';
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

    const result = `${dateString}${dateTimeSeparator}${timeString}`;

    return result;
  });

  const dateLabel = useDerivedValue(() => {
    if (!isCursorActive.get() && chartType === 'line')
      return quoteLastDate.value;

    const currentPriceDate = currentPrice.get()?.date;

    if (!currentPriceDate || currentPrice.get()?.isMockData) return '';

    const date = new Date(currentPriceDate);

    let relativeDateTimeLabel;

    if (chartIndex.get() === 0) {
      const dateString = date.toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeString = date.toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric',
      });
      relativeDateTimeLabel = `${dateString}${dateTimeSeparator}${timeString}`;
    } else if (chartIndex.get() === 1 || chartIndex.get() === 2) {
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

    return relativeDateTimeLabel;
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Label text={lastPrice} />
      <Label text={dateRange} />
      <Label text={dateLabel as any} />
    </View>
  );
}

export default CurrentPriceData;
