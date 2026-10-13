import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Y_MARGIN } from '../constants';
import { ChartPoint } from '../utils';

interface BarChartBarProps {
  barWidth: number;
  calculateBarHeight: (size: number) => number;
  calculateYValue: (value: number) => number;
  chartHeight: number;
  currentPoint: SharedValue<ChartPoint | null>;
  data: ChartPoint;
  leftOffset: number;
  onPress?: () => void;
  step: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function BarChartBar({
  barWidth,
  calculateBarHeight,
  calculateYValue,
  chartHeight,
  currentPoint,
  data,
  leftOffset,
  onPress,
  step,
}: BarChartBarProps) {
  const theme = useTheme();

  const { index, value } = data;
  const x = index * step;
  const barHeight = calculateBarHeight(value);

  const animatedRectProps = useAnimatedProps(() => {
    const isActive = index === currentPoint.get()?.index;
    return { fill: isActive ? theme.colors.blue800 : theme.colors.blue500 };
  });

  return (
    <>
      <Rect
        fill="transparent"
        height={chartHeight}
        onPress={onPress}
        transform={[{ translateY: Y_MARGIN }, { translateX: x + leftOffset }]}
        width={step}
      />
      <AnimatedRect
        animatedProps={animatedRectProps}
        height={Math.max(barHeight, 2)}
        onPress={onPress}
        transform={[
          { translateY: Y_MARGIN + calculateYValue(value) },
          { translateX: x + step / 2 - barWidth / 2 + leftOffset },
        ]}
        width={barWidth}
      />
    </>
  );
}

export default BarChartBar;
