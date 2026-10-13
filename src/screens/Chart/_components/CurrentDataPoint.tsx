import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { round } from '../formatters';
import { BuiltChart, ChartPoint } from '../utils';
import Label from './Label';

interface Props {
  chartIndex: SharedValue<number>;
  charts: BuiltChart[];
  currentPoint: SharedValue<ChartPoint | null>;
}

export function CurrentDataPoint({ chartIndex, charts, currentPoint }: Props) {
  const value = useDerivedValue(() => {
    return round(currentPoint.get()?.value, 2);
  });

  const dataSetLabel = useDerivedValue(() => {
    return charts[chartIndex.get()]?.label || '';
  });

  const pointLabel = useDerivedValue(() => {
    return currentPoint.get()?.label ?? '';
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Label text={value} />
      <Label text={dataSetLabel} />
      <Label text={pointLabel} />
    </View>
  );
}

export default CurrentDataPoint;
