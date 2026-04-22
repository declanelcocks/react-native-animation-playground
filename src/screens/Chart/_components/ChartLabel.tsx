import { Text, View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { Quote } from '../types';
import { Chart } from '../utils';
import Label from './Label';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  quote?: Quote;
}

export function ChartLabel({ charts, currentChartIndex, quote }: Props) {
  const intervalLabel = useDerivedValue(
    () => charts[currentChartIndex.value].intervalLabel,
  );

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Label style={{ fontSize: 8 }} text={intervalLabel} />
        </View>

        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          {!!quote?.currencySymbol && (
            <Text style={{ fontSize: 8 }}>{quote.currencySymbol}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default ChartLabel;
