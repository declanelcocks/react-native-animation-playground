import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Chart, Y_MARGIN } from '../utils';
import { BaseLabel } from './Label';

const LABEL_HEIGHT = 14;

export const Y_AXIS_LABELS_WIDTH = 32;

interface LabelSlotProps {
  chartIdx: number;
  currentChartIndex: SharedValue<number>;
  value: string;
  y: number;
}

interface LineSlotProps {
  chartIdx: number;
  currentChartIndex: SharedValue<number>;
  width: number;
  y: number;
}

interface Props {
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  height: number;
  width: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function YAxisLabels({
  charts,
  currentChartIndex,
  height,
  width,
}: Props) {
  const allLabels = charts.flatMap((chart, chartIdx) =>
    (chart.yAxisLabels ?? []).map((label, labelIdx) => ({
      ...label,
      chartIdx,
      key: `${chartIdx}-${labelIdx}`,
    })),
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height={height + Y_MARGIN * 2} width={width}>
        {allLabels.map(({ chartIdx, key, y }) => (
          <LineSlot
            chartIdx={chartIdx}
            currentChartIndex={currentChartIndex}
            key={key}
            width={width}
            y={y}
          />
        ))}
      </Svg>
      {allLabels.map(({ chartIdx, key, value, y }) => (
        <LabelSlot
          chartIdx={chartIdx}
          currentChartIndex={currentChartIndex}
          key={key}
          value={value}
          y={y}
        />
      ))}
    </View>
  );
}

function LabelSlot({ chartIdx, currentChartIndex, value, y }: LabelSlotProps) {
  const style = useAnimatedStyle(() => ({
    left: 0,
    opacity: currentChartIndex.value === chartIdx ? 1 : 0,
    position: 'absolute',
    top: y + Y_MARGIN - LABEL_HEIGHT / 2,
    width: Y_AXIS_LABELS_WIDTH,
  }));

  return (
    <Animated.View style={style}>
      <BaseLabel style={{ fontSize: 9 }} text={value} />
    </Animated.View>
  );
}

function LineSlot({ chartIdx, currentChartIndex, width, y }: LineSlotProps) {
  const theme = useTheme();

  const animatedProps = useAnimatedProps(() => ({
    opacity: currentChartIndex.value === chartIdx ? 1 : 0,
  }));

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={theme.colors.gray400}
      strokeDasharray={4}
      transform={[{ translateY: Y_MARGIN }]}
      x1={Y_AXIS_LABELS_WIDTH}
      x2={width + Y_AXIS_LABELS_WIDTH}
      y1={y}
      y2={y}
    />
  );
}

export default YAxisLabels;
