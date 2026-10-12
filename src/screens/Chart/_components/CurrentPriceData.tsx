import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { round } from '../formatters';
import { Chart, ChartPoint } from '../utils';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: Chart[];
  currentPrice: SharedValue<ChartPoint | null>;
}

export function CurrentPriceData({ chartIndex, charts, currentPrice }: Props) {
  const lastPrice = useDerivedValue(() => {
    return round(currentPrice.get()?.value, 2);
  });

  const dataSetLabel = useDerivedValue(() => {
    return charts[chartIndex.get()]?.label || '';
  });

  const pointLabel = useDerivedValue(() => {
    return currentPrice.get()?.label ?? '';
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Label text={lastPrice} />
      <Label text={dataSetLabel} />
      <Label text={pointLabel} />
    </View>
  );
}

export default CurrentPriceData;
