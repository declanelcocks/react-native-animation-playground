import { PropsWithChildren, useState } from 'react';
import { View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { runOnJS } from 'react-native-worklets';

import {
  CANDLESTICK_MARGIN,
  MAX_BAR_WIDTH,
  X_MARGIN,
  Y_AXIS_LABELS_WIDTH,
  Y_MARGIN,
} from '../constants';
import { Chart, ChartPoint } from '../utils';
import CandlestickChartCandle from './CandlestickChartCandle';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentPoint: SharedValue<ChartPoint | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function CandlestickChart({
  charts,
  children,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: PropsWithChildren<Props>) {
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
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
        labelsPosition={labelsPosition}
        width={width}
      />
      <Svg height={height + Y_MARGIN * 2} width={width + X_MARGIN}>
        <YAxisLines
          charts={charts}
          currentChartIndex={currentChartIndex}
          labelsPosition={labelsPosition}
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
                MAX_BAR_WIDTH,
              )}
              currentPoint={currentPoint}
              data={{ ...d, index: i }}
              key={i}
              leftOffset={leftOffset}
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
