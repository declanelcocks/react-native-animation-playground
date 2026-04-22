import React, { useState } from 'react';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { Line, Text } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme';

import { Chart, X_MARGIN, Y_MARGIN } from '../utils';

const AXIS_FONT_SIZE = 8;

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  width: number;
}

export function YAxisLabels({ charts, currentChartIndex, width }: Props) {
  const theme = useTheme();
  const [chartIndex, setChartIndex] = useState<number>();

  useDerivedValue(() => {
    if (currentChartIndex.value !== chartIndex) {
      scheduleOnRN(() => {
        setChartIndex(currentChartIndex.value);
      });
    }
  }, [chartIndex]);

  return charts[currentChartIndex.value].yAxisLabels?.map(
    ({ prominent, value, y }, i) => {
      return (
        <React.Fragment key={i}>
          <Text
            dx={X_MARGIN / 2}
            fontSize={AXIS_FONT_SIZE}
            fontWeight="100"
            stroke={theme.colors.gray50}
            textAnchor="middle"
            transform={[
              { translateY: y + AXIS_FONT_SIZE * 0.25 },
              { translateX: width },
            ]}
          >
            {value}
          </Text>
          <Line
            stroke={prominent ? theme.colors.gray50 : theme.colors.gray400}
            strokeDasharray={4}
            strokeWidth={prominent ? 2 : 1}
            transform={[{ translateY: Y_MARGIN }]}
            x1={0}
            x2={width}
            y1={y}
            y2={y}
          />
        </React.Fragment>
      );
    },
  );
}

export default YAxisLabels;
