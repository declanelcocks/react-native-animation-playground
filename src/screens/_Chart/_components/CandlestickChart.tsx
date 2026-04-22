import { PropsWithChildren, useState } from 'react';
import React from 'react';
import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Chart, X_MARGIN, Y_MARGIN } from '../utils';
import YAxisLabels from './YAxisLabels';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  height: number;
  width: number;
}

export const CANDLESTICK_MARGIN = 1;

export function CandlestickChart({
  charts,
  children,
  currentChartIndex,
  height,
  width,
}: PropsWithChildren<Props>) {
  const theme = useTheme();
  const [chartIndex, setChartIndex] = useState<number>();

  useDerivedValue(() => {
    if (currentChartIndex.value !== chartIndex) {
      scheduleOnRN(() => {
        setChartIndex(currentChartIndex.value);
      });
    }
  }, [chartIndex]);

  return (
    <View style={{ width: width + X_MARGIN }}>
      <Svg height={height + Y_MARGIN * 2} width={width + X_MARGIN}>
        <YAxisLabels
          charts={charts}
          currentChartIndex={currentChartIndex}
          width={width}
        />

        {charts[currentChartIndex.value].data.map((d, i) => {
          const step = width / charts[currentChartIndex.value].data.length;
          const { close, high, low, open } = d;
          const trend =
            !close || !open
              ? theme.colors.green500
              : close >= open
                ? theme.colors.green500
                : theme.colors.red500;
          const x = i * step;
          const max = Math.max(open ?? 0, close ?? 0);
          const min = Math.min(open ?? 0, close ?? 0);

          const candleHeight = charts[currentChartIndex.value].scaleBody(
            max - min,
          );

          const candleWidth = Math.min(step - CANDLESTICK_MARGIN * 2, 30);

          return (
            <React.Fragment key={i}>
              <Line
                stroke={trend}
                strokeWidth={0.5}
                transform={[{ translateY: Y_MARGIN }]}
                x1={x + step / 2}
                x2={x + step / 2}
                y1={charts[currentChartIndex.value].scaleY(low ?? 0)}
                y2={charts[currentChartIndex.value].scaleY(high ?? 0)}
              />

              <Rect
                height={Math.max(candleHeight, 2)}
                {...{ fill: trend }}
                transform={[
                  {
                    translateY:
                      Y_MARGIN + charts[currentChartIndex.value].scaleY(max),
                  },
                  {
                    translateX: x + step / 2 - candleWidth / 2,
                  },
                ]}
                width={candleWidth}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {children}
    </View>
  );
}

export default CandlestickChart;
