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
const LABELS_GAP = 4;

export const Y_AXIS_LABELS_WIDTH = 32;

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
  charts: Chart[];
  currentChartIndex: SharedValue<number>;
  height: number;
  labelsPosition?: 'left' | 'right';
  width: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function YAxisLabels({
  charts,
  currentChartIndex,
  height,
  labelsPosition,
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
            labelsPosition={labelsPosition}
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
          labelLeft={labelsPosition === 'right' ? width - Y_AXIS_LABELS_WIDTH + LABELS_GAP : 0}
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
}: Omit<Props, 'height'>) {
  const allLabels = charts.flatMap((chart, chartIdx) =>
    (chart.yAxisLabels ?? []).map((label, labelIdx) => ({
      ...label,
      chartIdx,
      key: `${chartIdx}-${labelIdx}`,
    })),
  );

  return (
    <>
      {allLabels.map(({ chartIdx, key, y }) => (
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

function LabelSlot({ chartIdx, currentChartIndex, labelLeft, value, y }: LabelSlotProps) {
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

function LineSlot({ chartIdx, currentChartIndex, labelsPosition, width, y }: LineSlotProps) {
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
