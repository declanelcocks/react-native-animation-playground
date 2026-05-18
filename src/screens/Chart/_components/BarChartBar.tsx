import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

import { FormattedItemWithIndex, Y_MARGIN } from '../utils';

interface BarChartBarProps {
  barWidth: number;
  calculateBarHeight: (size: number) => number;
  calculateYValue: (value: number) => number;
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
  data: FormattedItemWithIndex;
  leftOffset: number;
  onPress?: () => void;
  step: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function BarChartBar({
  barWidth,
  calculateBarHeight,
  calculateYValue,
  currentPrice,
  data,
  leftOffset,
  onPress,
  step,
}: BarChartBarProps) {
  const theme = useTheme();

  const { close, index } = data;
  const x = index * step;
  const barHeight = calculateBarHeight(close ?? 0);

  const animatedRectProps = useAnimatedProps(() => {
    const isActive = index === currentPrice.get()?.index;
    return { fill: isActive ? theme.colors.blue800 : theme.colors.blue500 };
  });

  return (
    <AnimatedRect
      animatedProps={animatedRectProps}
      height={Math.max(barHeight, 2)}
      onPress={onPress}
      transform={[
        { translateY: Y_MARGIN + calculateYValue(close ?? 0) },
        { translateX: x + step / 2 - barWidth / 2 + leftOffset },
      ]}
      width={barWidth}
    />
  );
}

export default BarChartBar;
