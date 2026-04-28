import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { round } from '../formatters';
import { Chart, FormattedItemWithIndex } from '../utils';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: Chart[];
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
}

export function CurrentPriceData({ chartIndex, charts, currentPrice }: Props) {
  const dateTimeSeparator = ' @ ';

  const lastPrice = useDerivedValue(() => {
    return round(currentPrice.get()?.close, 2);
  });

  const dateRange = useDerivedValue(() => {
    return charts[chartIndex.get()]?.dateRangeLabel || '';
  });

  const dateLabel = useDerivedValue(() => {
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
