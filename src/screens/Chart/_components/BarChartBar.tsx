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
  chartHeight: number;
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
  chartHeight,
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
          { translateY: Y_MARGIN + calculateYValue(close ?? 0) },
          { translateX: x + step / 2 - barWidth / 2 + leftOffset },
        ]}
        width={barWidth}
      />
    </>
  );
}

export default BarChartBar;
