import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Line, Rect } from 'react-native-svg';

import { useChartTheme } from '../theme';
import { ChartPoint } from '../utils';

interface CandlestickChartCandleProps {
  activePoint: SharedValue<ChartPoint | null>;
  calculateCandleHeight: (size: number) => number;
  calculateYValue: (value: number) => number;
  candleWidth: number;
  data: ChartPoint;
  leftOffset: number;
  step: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function CandlestickChartCandle({
  activePoint,
  calculateCandleHeight,
  calculateYValue,
  candleWidth,
  data,
  leftOffset,
  step,
}: CandlestickChartCandleProps) {
  const theme = useChartTheme();
  const { yMargin } = theme.layout;

  const { close, high, index, low, open } = data;
  const x = index * step;
  const max = Math.max(open ?? 0, close ?? 0);
  const min = Math.min(open ?? 0, close ?? 0);

  const candleHeight = calculateCandleHeight(max - min);

  const getCandleColor = (isActive: boolean) => {
    'worklet';

    const isPositive = !close || !open || close >= open;

    if (isPositive) {
      return isActive ? theme.colors.positiveActive : theme.colors.positive;
    }

    return isActive ? theme.colors.negativeActive : theme.colors.negative;
  };

  // `activePoint` is read here rather than in `getCandleColor`, so the props
  // update when it changes.
  const animatedLineProps = useAnimatedProps(() => ({
    stroke: getCandleColor(index === activePoint.get()?.index),
  }));

  const animatedRectProps = useAnimatedProps(() => ({
    fill: getCandleColor(index === activePoint.get()?.index),
  }));

  return (
    <>
      <AnimatedLine
        animatedProps={animatedLineProps}
        strokeWidth={2}
        transform={[{ translateY: yMargin }, { translateX: leftOffset }]}
        x1={x + step / 2}
        x2={x + step / 2}
        y1={calculateYValue(low ?? 0)}
        y2={calculateYValue(high ?? 0)}
      />

      <AnimatedRect
        animatedProps={animatedRectProps}
        height={Math.max(candleHeight, 2)}
        transform={[
          {
            translateY: yMargin + calculateYValue(max),
          },
          {
            translateX: x + step / 2 - candleWidth / 2 + leftOffset,
          },
        ]}
        width={candleWidth}
      />
    </>
  );
}

export default CandlestickChartCandle;
