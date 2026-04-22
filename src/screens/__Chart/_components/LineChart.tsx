import { interpolatePath } from 'd3-interpolate-path';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Chart, X_MARGIN, Y_MARGIN } from '../utils';
import Gradient from './Gradient';
import YAxisLabels from './YAxisLabels';

export const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  currentTrend: Readonly<SharedValue<'negative' | 'positive'>>;
  height: number;
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
  previousChartIndex,
  previousTrend,
  transition,
  width,
}: PropsWithChildren<Props>) {
  const theme = useTheme();

  const animatedProps = useAnimatedProps(() => {
    const previousChart = charts[previousChartIndex.value];
    const currentChart = charts[currentChartIndex.value];

    // When 1 datapoint and rerender before mockpoint, interpolatePath() breaks
    // TODO: find a better workaround
    if (!currentChart.rawPath || currentChart.rawPath.endsWith('Z')) {
      return {
        d: '',
        stroke: theme.colors.green500,
      };
    }

    const interpolator = interpolatePath(
      !previousChart.rawPath && currentChart.rawPath
        ? currentChart.rawPath
        : previousChart.rawPath,
      currentChart.rawPath,
    );
    const d = interpolator(transition.value);

    return {
      d,
      stroke: interpolateColor(
        transition.value,
        [0, 1],
        [theme.colors.green500, theme.colors.red500],
      ),
    };
  });

  const animatedPositiveGradientProps = useAnimatedProps(() => {
    const previousChart = charts[previousChartIndex.value];
    const currentChart = charts[currentChartIndex.value];

    if (!currentChart.rawPath || currentChart.rawPath.endsWith('Z')) {
      return {
        d: '',
        opacity: 1,
      };
    }

    const interpolator = interpolatePath(
      !previousChart.rawPath && currentChart.rawPath
        ? currentChart.rawPath
        : previousChart.rawPath,
      currentChart.rawPath,
    );
    const d = interpolator(transition.value);

    const opacity =
      currentTrend.value === 'positive'
        ? previousTrend?.value === 'negative'
          ? interpolate(transition.value, [0, 1], [0, 1])
          : 1
        : previousTrend?.value === 'positive'
          ? interpolate(transition.value, [0, 1], [1, 0])
          : 0;

    return {
      d: `${d} L ${width} ${height} L 0 ${height}`,
      opacity,
    };
  });

  const animatedNegativeGradientProps = useAnimatedProps(() => {
    const previousChart = charts[previousChartIndex.value];
    const currentChart = charts[currentChartIndex.value];

    if (!currentChart.rawPath || currentChart.rawPath.endsWith('Z')) {
      return {
        d: '',
        opacity: 1,
      };
    }

    const interpolator = interpolatePath(
      !previousChart.rawPath && currentChart.rawPath
        ? currentChart.rawPath
        : previousChart.rawPath,
      currentChart.rawPath,
    );
    const d = interpolator(transition.value);

    const opacity =
      currentTrend.value === 'negative'
        ? previousTrend?.value === 'positive'
          ? interpolate(transition.value, [0, 1], [0, 1])
          : 1
        : previousTrend?.value === 'negative'
          ? interpolate(transition.value, [0, 1], [1, 0])
          : 0;

    return {
      d: `${d} L ${width} ${height} L 0 ${height}`,
      opacity,
    };
  });

  return (
    <View style={{ width: width + X_MARGIN }}>
      <Svg height={height + Y_MARGIN * 2} width={width + X_MARGIN}>
        <YAxisLabels
          charts={charts}
          currentChartIndex={currentChartIndex}
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
