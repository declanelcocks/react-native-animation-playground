import { PropsWithChildren, useId } from 'react';
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

import { BuiltChart } from '../../utils/buildCharts';
import { useChartTheme } from '../../utils/theme';
import Gradient from '../Gradient';
import YAxisLabels, { YAxisLines } from '../YAxisLabels';

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
  const theme = useChartTheme();
  const { xMargin, yAxisWidth, yMargin } = theme.layout;
  // Gradient IDs are global to the page, so each chart needs its own. React's
  // IDs contain `:`, which isn't valid inside `url(#...)`.
  const gradientId = useId().replaceAll(':', '');
  const positiveGradientId = `${gradientId}-positive`;
  const negativeGradientId = `${gradientId}-negative`;
  const leftOffset = labelsPosition === 'right' ? 0 : yAxisWidth;
  const rightOffset = labelsPosition === 'right' ? yAxisWidth : 0;

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
        stroke: theme.colors.positive,
      };
    }

    return {
      d,
      stroke: interpolateColor(
        transition.get(),
        [0, 1],
        [
          previousChart.trend === 'positive'
            ? theme.colors.positive
            : theme.colors.negative,
          currentChart.trend === 'positive'
            ? theme.colors.positive
            : theme.colors.negative,
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

        <Gradient
          id={positiveGradientId}
          trend="positive"
          {...{ translateY: yMargin }}
        />

        <Gradient
          id={negativeGradientId}
          trend="negative"
          {...{ translateY: yMargin }}
        />

        <AnimatedPath
          animatedProps={animatedProps}
          fill="transparent"
          strokeWidth={2}
          transform={[{ translateY: yMargin }]}
        />

        <AnimatedPath
          animatedProps={animatedNegativeGradientProps}
          fill={`url(#${negativeGradientId})`}
          transform={[{ translateY: yMargin }]}
        />

        <AnimatedPath
          animatedProps={animatedPositiveGradientProps}
          fill={`url(#${positiveGradientId})`}
          transform={[{ translateY: yMargin }]}
        />
      </Svg>

      {children}
    </View>
  );
}

export default LineChart;
