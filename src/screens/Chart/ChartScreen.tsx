import { useMemo, useState } from 'react';
import { Button, Dimensions, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import Chart from './Chart';
import { dataSetA, dataSetB } from './data';
import { ChartThemeOverride } from './theme';
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
  const { colors } = useTheme();
  const [type, setType] = useState<ChartType>('candlestick');

  // Follow the app's theme, including its dark variant.
  const chartTheme = useMemo<ChartThemeOverride>(
    () => ({
      colors: {
        axisLine: colors.gray400,
        bar: colors.blue500,
        barActive: colors.blue800,
        buttonActive: colors.purple500,
        buttonInactive: colors.gray200,
        buttonTextActive: colors.white,
        buttonTextInactive: colors.gray400,
        crosshair: colors.gray800,
        gridLine: colors.gray400,
        negative: colors.red500,
        negativeActive: colors.red800,
        positive: colors.green500,
        positiveActive: colors.green800,
      },
    }),
    [colors],
  );
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
        theme={chartTheme}
        width={Dimensions.get('window').width - 32}
      />
    </>
  );
}

export default ChartScreen;
