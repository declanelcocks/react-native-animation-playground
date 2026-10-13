import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Line } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Y_AXIS_LABELS_WIDTH, Y_MARGIN } from '../constants';
import { BuiltChart } from '../utils';
import { BaseLabel } from './Label';

const LABEL_HEIGHT = 14;
const LABELS_GAP = 4;

interface LabelSlotProps {
  chartIdx: number;
  currentChartIndex: SharedValue<number>;
  labelLeft: number;
  value: string;
  y: number;
}

interface LineSlotProps {
  chartIdx: number;
  currentChartIndex: SharedValue<number>;
  labelsPosition?: 'left' | 'right';
  width: number;
  y: number;
}

interface Props {
  charts: BuiltChart[];
  currentChartIndex: SharedValue<number>;
  labelsPosition?: 'left' | 'right';
  width: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

const getAxisLabels = (charts: BuiltChart[]) =>
  charts.flatMap((chart, chartIdx) =>
    (chart.yAxisLabels ?? []).map((label, labelIdx) => ({
      ...label,
      chartIdx,
      key: `${chartIdx}-${labelIdx}`,
    })),
  );

/**
 * The y-axis value labels. Render it outside the chart's `Svg`; the grid lines
 * come from `YAxisLines`, which has to be rendered inside it.
 */
export function YAxisLabels({
  charts,
  currentChartIndex,
  labelsPosition,
  width,
}: Props) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {getAxisLabels(charts).map(({ chartIdx, key, value, y }) => (
        <LabelSlot
          chartIdx={chartIdx}
          currentChartIndex={currentChartIndex}
          key={key}
          labelLeft={
            labelsPosition === 'right'
              ? width - Y_AXIS_LABELS_WIDTH + LABELS_GAP
              : 0
          }
          value={value}
          y={y}
        />
      ))}
    </View>
  );
}

export function YAxisLines({
  charts,
  currentChartIndex,
  labelsPosition,
  width,
}: Props) {
  return (
    <>
      {getAxisLabels(charts).map(({ chartIdx, key, y }) => (
        <LineSlot
          chartIdx={chartIdx}
          currentChartIndex={currentChartIndex}
          key={key}
          labelsPosition={labelsPosition}
          width={width}
          y={y}
        />
      ))}
    </>
  );
}

function LabelSlot({
  chartIdx,
  currentChartIndex,
  labelLeft,
  value,
  y,
}: LabelSlotProps) {
  const style = useAnimatedStyle(() => ({
    left: labelLeft,
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

function LineSlot({
  chartIdx,
  currentChartIndex,
  labelsPosition,
  width,
  y,
}: LineSlotProps) {
  const theme = useTheme();

  const animatedProps = useAnimatedProps(() => ({
    opacity: currentChartIndex.value === chartIdx ? 1 : 0,
  }));

  const x1 = labelsPosition === 'right' ? 0 : Y_AXIS_LABELS_WIDTH;
  const x2 = labelsPosition === 'right' ? width - Y_AXIS_LABELS_WIDTH : width;

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={theme.colors.gray400}
      strokeDasharray={4}
      transform={[{ translateY: Y_MARGIN }]}
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
    />
  );
}

export default YAxisLabels;
