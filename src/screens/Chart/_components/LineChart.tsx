import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import { interpolatePath } from 'react-native-redash';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import { X_MARGIN, Y_AXIS_LABELS_WIDTH, Y_MARGIN } from '../constants';
import { BuiltChart } from '../utils';
import Gradient from './Gradient';
import YAxisLabels, { YAxisLines } from './YAxisLabels';

export const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  currentTrend: Readonly<SharedValue<'negative' | 'positive'>>;
  height: number;
  labelsPosition?: 'left' | 'right';
  previousChartIndex: SharedValue<number>;
  previousTrend?: Readonly<SharedValue<'negative' | 'positive'>>;
  transition: SharedValue<number>;
  width: number;
}

export function LineChart({
  charts,
  children,
  currentChartIndex,
  currentTrend,
  height,
  labelsPosition,
  previousChartIndex,
  previousTrend,
  transition,
  width,
}: PropsWithChildren<Props>) {
  const theme = useTheme();
  const leftOffset = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const rightOffset = labelsPosition === 'right' ? Y_AXIS_LABELS_WIDTH : 0;

  // The path morphing between the previous and the current data set. Empty when
  // there's nothing to draw.
  const interpolatedPath = useDerivedValue(() => {
    const previousChart = charts[previousChartIndex.get()];
    const currentChart = charts[currentChartIndex.get()];

    // When 1 datapoint and rerender before mockpoint, interpolatePath() breaks
    // TODO: find a better workaround
    if (!currentChart.rawPath || currentChart.rawPath.endsWith('Z')) {
      return '';
    }

    return interpolatePath(
      transition.get(),
      [0, 1],
      [
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !previousChart.path && currentChart.path
          ? currentChart.path
          : previousChart.path,
        currentChart.path,
      ],
    );
  });

  const animatedProps = useAnimatedProps(() => {
    const previousChart = charts[previousChartIndex.get()];
    const currentChart = charts[currentChartIndex.get()];
    const d = interpolatedPath.get();

    if (!d) {
      return {
        d: '',
        stroke: theme.colors.green500,
      };
    }

    return {
      d,
      stroke: interpolateColor(
        transition.get(),
        [0, 1],
        [
          previousChart.trend === 'positive'
            ? theme.colors.green500
            : theme.colors.red500,
          currentChart.trend === 'positive'
            ? theme.colors.green500
            : theme.colors.red500,
        ],
      ),
    };
  });

  const animatedPositiveGradientProps = useAnimatedProps(() => {
    const d = interpolatedPath.get();

    if (!d) {
      return {
        d: '',
        opacity: 1,
      };
    }

    const opacity =
      currentTrend.get() === 'positive'
        ? previousTrend?.get() === 'negative'
          ? interpolate(transition.get(), [0, 1], [0, 1])
          : 1
        : previousTrend?.get() === 'positive'
          ? interpolate(transition.get(), [0, 1], [1, 0])
          : 0;

    return {
      d: `${d} L ${width - rightOffset} ${height} L ${leftOffset} ${height}`,
      opacity,
    };
  });

  const animatedNegativeGradientProps = useAnimatedProps(() => {
    const d = interpolatedPath.get();

    if (!d) {
      return {
        d: '',
        opacity: 1,
      };
    }

    const opacity =
      currentTrend.get() === 'negative'
        ? previousTrend?.get() === 'positive'
          ? interpolate(transition.get(), [0, 1], [0, 1])
          : 1
        : previousTrend?.get() === 'negative'
          ? interpolate(transition.get(), [0, 1], [1, 0])
          : 0;

    return {
      d: `${d} L ${width - rightOffset} ${height} L ${leftOffset} ${height}`,
      opacity,
    };
  });

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

        <Gradient trend="positive" {...{ translateY: Y_MARGIN }} />

        <Gradient trend="negative" {...{ translateY: Y_MARGIN }} />

        <AnimatedPath
          animatedProps={animatedProps}
          fill="transparent"
          strokeWidth={2}
          transform={[{ translateY: Y_MARGIN }]}
        />

        <AnimatedPath
          animatedProps={animatedNegativeGradientProps}
          fill="url(#negative)"
          transform={[{ translateY: Y_MARGIN }]}
        />

        <AnimatedPath
          animatedProps={animatedPositiveGradientProps}
          fill="url(#positive)"
          transform={[{ translateY: Y_MARGIN }]}
        />
      </Svg>

      {children}
    </View>
  );
}

export default LineChart;
