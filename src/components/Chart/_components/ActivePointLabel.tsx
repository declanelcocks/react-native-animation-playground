import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { round } from '../formatters';
import { BuiltChart, ChartPoint } from '../utils';
import Label from './Label';

interface Props {
  activePoint: SharedValue<ChartPoint | null>;
  chartIndex: SharedValue<number>;
  charts: BuiltChart[];
}

export function ActivePointLabel({ activePoint, chartIndex, charts }: Props) {
  const value = useDerivedValue(() => {
    return round(activePoint.get()?.value, 2);
  });

  const dataSetLabel = useDerivedValue(() => {
    return charts[chartIndex.get()]?.label || '';
  });

  const pointLabel = useDerivedValue(() => {
    return activePoint.get()?.label ?? '';
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Label text={value} />
      <Label text={dataSetLabel} />
      <Label text={pointLabel} />
    </View>
  );
}

export default ActivePointLabel;
