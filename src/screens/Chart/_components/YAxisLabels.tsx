import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { Line, Text } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Chart, Y_MARGIN } from '../utils';

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  width: number;
}

export const Y_AXIS_LABELS_WIDTH = 32;

export function YAxisLabels({ charts, currentChartIndex, width }: Props) {
  const theme = useTheme();

  return charts[currentChartIndex.get()].yAxisLabels?.map(({ value, y }, i) => {
    return (
      <React.Fragment key={i}>
        <Text
          fontSize={8}
          fontWeight="100"
          stroke={theme.colors.gray400}
          textAnchor="start"
          transform={[{ translateY: y + 6 }]}
        >
          {value}
        </Text>
        <Line
          stroke={theme.colors.gray400}
          strokeDasharray={4}
          transform={[{ translateY: Y_MARGIN }]}
          x1={Y_AXIS_LABELS_WIDTH}
          x2={width}
          y1={y}
          y2={y}
        />
      </React.Fragment>
    );
  });
}

export default YAxisLabels;
