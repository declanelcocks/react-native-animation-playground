import { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { X_MARGIN, Y_MARGIN } from '../constants';
import { BuiltChart } from '../utils';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

interface Props {
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  height: number;
  labelsPosition?: 'left' | 'right';
  /** The SVG elements drawn on top of the grid lines (bars, candles, ...). */
  plot: ReactNode;
  width: number;
}

/**
 * The shared frame of the charts that put one item in each step (bar and
 * candlestick): the y-axis labels and grid lines, with `plot` drawn on top and
 * `children` (the cursor overlay) over everything.
 */
export function SteppedChartFrame({
  charts,
  children,
  currentChartIndex,
  height,
  labelsPosition,
  plot,
  width,
}: PropsWithChildren<Props>) {
  return (
    <View style={{ width: width + X_MARGIN }}>
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
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

        {plot}
      </Svg>

      {children}
    </View>
  );
}

export default SteppedChartFrame;
