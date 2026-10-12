import { useState } from 'react';
import { Button, Dimensions, Text, View } from 'react-native';

import Chart from './Chart';
import { dataSetA, dataSetB } from './data';
import {
  CandlestickDataPoint,
  ChartData,
  ChartType,
  DataPoint,
  DataSet,
} from './types';

const toDataPoints = ({
  data,
  label,
}: DataSet<CandlestickDataPoint>): DataSet<DataPoint> => ({
  data: data.map((point) => ({ label: point.label, value: point.close })),
  label,
});

const candlestickDataSets = [dataSetA, dataSetB];
const valueDataSets = candlestickDataSets.map((dataSet) =>
  toDataPoints(dataSet),
);

export function ChartScreen() {
  const [type, setType] = useState<ChartType>('candlestick');
  const [labelPosition, setLabelPosition] = useState<'left' | 'right'>('left');

  const chartData: ChartData =
    type === 'candlestick'
      ? { dataSets: candlestickDataSets, type }
      : { dataSets: valueDataSets, type };

  return (
    <>
      <View style={{ padding: 16 }}>
        <Text>Chart Type:</Text>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
          <Button
            onPress={() => {
              setType('line');
            }}
            title="Line"
          />
          <Button
            onPress={() => {
              setType('candlestick');
            }}
            title="Candle"
          />
          <Button
            onPress={() => {
              setType('bar');
            }}
            title="Bar"
          />
          <Button
            onPress={() => {
              setType('bar-scrollable');
            }}
            title="Scroll Bar"
          />
        </View>

        <Text>Label position:</Text>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
          <Button
            onPress={() => {
              setLabelPosition('left');
            }}
            title="Left"
          />
          <Button
            onPress={() => {
              setLabelPosition('right');
            }}
            title="Right"
          />
        </View>
      </View>

      <Chart
        {...chartData}
        height={200}
        labelsPosition={labelPosition}
        width={Dimensions.get('window').width - 32}
      />
    </>
  );
}

export default ChartScreen;
