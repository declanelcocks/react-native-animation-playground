import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import {
  CANDLESTICK_MARGIN,
  MAX_BAR_WIDTH,
  X_MARGIN,
  Y_AXIS_LABELS_WIDTH,
  Y_MARGIN,
} from '../constants';
import { BuiltChart, ChartPoint } from '../utils';
import CandlestickChartCandle from './CandlestickChartCandle';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

interface Props {
  chart: BuiltChart;
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  currentPoint: SharedValue<ChartPoint | null>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

export function CandlestickChart({
  chart,
  charts,
  children,
  currentChartIndex,
  currentPoint,
  height,
  labelsPosition,
  width,
}: PropsWithChildren<Props>) {
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const candlestickChartWidth = width - Y_AXIS_LABELS_WIDTH;

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

        {chart.data.map((d, i) => {
          return (
            <CandlestickChartCandle
              calculateCandleHeight={(size: number) => chart.scaleBody(size)}
              calculateYValue={(value: number) => chart.scaleY(value)}
              candleWidth={Math.min(
                candlestickChartWidth / chart.data.length -
                  CANDLESTICK_MARGIN * 2,
                MAX_BAR_WIDTH,
              )}
              currentPoint={currentPoint}
              data={{ ...d, index: i }}
              key={i}
              leftOffset={leftOffset}
              step={candlestickChartWidth / chart.data.length}
            />
          );
        })}
      </Svg>

      {children}
    </View>
  );
}

export default CandlestickChart;
