import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';

import { useChartTheme } from '../theme';
import { ChartPoint } from '../utils';

interface BarChartBarProps {
  barWidth: number;
  baselineY: number;
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
  baselineY,
  calculateYValue,
  chartHeight,
  currentPoint,
  data,
  leftOffset,
  onPress,
  step,
}: BarChartBarProps) {
  const theme = useChartTheme();
  const { yMargin } = theme.layout;

  const { index, value } = data;
  const x = index * step;
  const valueY = calculateYValue(value);
  const barTop = Math.min(valueY, baselineY);
  const barHeight = Math.abs(valueY - baselineY);

  const animatedRectProps = useAnimatedProps(() => {
    const isActive = index === currentPoint.get()?.index;
    return { fill: isActive ? theme.colors.barActive : theme.colors.bar };
  });

  return (
    <>
      <Rect
        fill="transparent"
        height={chartHeight}
        onPress={onPress}
        transform={[{ translateY: yMargin }, { translateX: x + leftOffset }]}
        width={step}
      />
      <AnimatedRect
        animatedProps={animatedRectProps}
        height={Math.max(barHeight, 2)}
        onPress={onPress}
        transform={[
          { translateY: yMargin + barTop },
          { translateX: x + step / 2 - barWidth / 2 + leftOffset },
        ]}
        width={barWidth}
      />
    </>
  );
}

export default BarChartBar;
