import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Chart, FormattedItem, round } from '../utils';
import { CANDLESTICK_MARGIN } from './CandlestickChart';
import Label from './Label';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentPrice?: SharedValue<FormattedItem | null>;
  height: number;
  isCursorActive: SharedValue<boolean>;
  width: number;
}

export function VolumeChart({
  charts,
  currentChartIndex,
  currentPrice,
  height,
  isCursorActive,
  width,
}: Props) {
  const theme = useTheme();

  /**
   * TODO: Using state to re-render animation is a hack also used in
   * CandlestickChart.tsx. Both instances should be done as in
   * LineChart.tsx
   */
  const [chartIndex, setChartIndex] = useState<number>();
  useDerivedValue(() => {
    if (currentChartIndex.value !== chartIndex) {
      scheduleOnRN(() => {
        setChartIndex(currentChartIndex.value);
      });
    }
  }, [chartIndex]);

  const volumeValue = useDerivedValue(() => {
    const volume = currentPrice?.value ? round(currentPrice.value.volume) : '0';
    return volume;
  }, [currentPrice, isCursorActive]);

  const chartData = charts[currentChartIndex.value].data.filter(
    (d) => !d.isMockData,
  );
  const step = width / chartData.length;
  const barWidth = Math.min(step - CANDLESTICK_MARGIN * 2, 30);

  return (
    <Animated.View>
      <View style={{ paddingVertical: 8, width }}>
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={{ fontSize: 12 }}>volume</Text>
            <Text style={{ fontSize: 12 }}>{': '}</Text>
            <Label
              style={{
                // Fixes an issue on iPad where half of the number is cropped
                height: 'auto',
                lineHeight: Platform.OS === 'ios' ? 0 : undefined,
              }}
              text={volumeValue}
            />
          </View>
        </View>

        <View>
          <Svg height={height} width={width}>
            {chartData.map((d, i) => {
              const { close, open, volume } = d;
              const x = i * step;
              const fill =
                !close || !open
                  ? theme.colors.green500
                  : close > open
                    ? theme.colors.green500
                    : theme.colors.red500;
              return (
                <Rect
                  fill={fill}
                  height={height}
                  key={i}
                  transform={[
                    { translateX: x + step / 2 - barWidth / 2 },
                    {
                      translateY:
                        charts[currentChartIndex.value].scaleYVolume(
                          volume ?? 0,
                        ) || 0,
                    },
                  ]}
                  width={barWidth}
                />
              );
            })}
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}

export default VolumeChart;
