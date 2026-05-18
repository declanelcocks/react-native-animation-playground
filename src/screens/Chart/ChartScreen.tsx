import { useState } from 'react';
import { Button, Dimensions, Text, View } from 'react-native';

import Chart from './Chart';
import { oneDayTimeSlice, oneMonthTimeSlice } from './data';

export function ChartScreen() {
  const [type, setType] = useState<'bar-scrollable' | 'bar' | 'candlestick' | 'line'>('candlestick');
  const [labelPosition, setLabelPosition] = useState<'left' | 'right'>('left');

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
        data={[oneDayTimeSlice, oneMonthTimeSlice]}
        height={200}
        labelsPosition={labelPosition}
        type={type}
        width={Dimensions.get('window').width - 32}
      />
    </>
  );
}

export default ChartScreen;
