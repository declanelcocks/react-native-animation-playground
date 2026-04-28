import { PropsWithChildren, useState } from 'react';
import { View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { runOnJS } from 'react-native-worklets';

import { Chart, FormattedItemWithIndex, X_MARGIN, Y_MARGIN } from '../utils';
import CandlestickChartCandle from './CandlestickChartCandle';
import YAxisLabels, { Y_AXIS_LABELS_WIDTH, YAxisLines } from './YAxisLabels';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
  height: number;
  width: number;
}

export const CANDLESTICK_MARGIN = 1;

export function CandlestickChart({
  charts,
  children,
  currentChartIndex,
  currentPrice,
  height,
  width,
}: PropsWithChildren<Props>) {
  const [chartIndex, setChartIndex] = useState<number>();

  useAnimatedReaction(
    () => currentChartIndex.value,
    (current) => {
      if (current !== chartIndex) {
        runOnJS(setChartIndex)(current);
      }
    },
  );

  const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;

  const currentChart = charts[currentChartIndex.get()];

  return (
    <View style={{ width: width + X_MARGIN }}>
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
        height={height}
        width={width}
      />
      <Svg height={height + Y_MARGIN * 2} width={width + X_MARGIN}>
        <YAxisLines
          charts={charts}
          currentChartIndex={currentChartIndex}
          width={width}
        />

        {currentChart.data.map((d, i) => {
          return (
            <CandlestickChartCandle
              calculateCandleHeight={(size: number) =>
                currentChart.scaleBody(size)
              }
              calculateYValue={(value: number) => currentChart.scaleY(value)}
              candleWidth={Math.min(
                candlestickChartWidth / currentChart.data.length -
                  CANDLESTICK_MARGIN * 2,
                30,
              )}
              currentPrice={currentPrice}
              data={{ ...d, index: i }}
              key={i}
              step={candlestickChartWidth / currentChart.data.length}
            />
          );
        })}
      </Svg>

      {children}
    </View>
  );
}

export default CandlestickChart;
