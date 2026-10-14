import { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { BuiltChart } from '../../utils/buildCharts';
import { useChartTheme } from '../../utils/theme';
import YAxisLabels, { YAxisLines } from '../YAxisLabels';

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
 * Wrapper component for stepped charts (bar, candlestick, etc.) that renders one
 * data point per step.
 *
 * This component provides the shared layout for stepped charts: it renders the
 * y-axis labels and grid lines. The user provides a `plot` prop that dictates
 * how each data point is rendered. Children (such as gesture handlers for cursors)
 * are rendered on top of the chart.
 */
export function SteppedChartWrapper({
  charts,
  children,
  currentChartIndex,
  height,
  labelsPosition,
  plot,
  width,
}: PropsWithChildren<Props>) {
  const { xMargin, yMargin } = useChartTheme().layout;
  return (
    <View style={{ width: width + xMargin }}>
      <YAxisLabels
        charts={charts}
        currentChartIndex={currentChartIndex}
        labelsPosition={labelsPosition}
        width={width}
      />
      <Svg height={height + yMargin * 2} width={width + xMargin}>
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

export default SteppedChartWrapper;
