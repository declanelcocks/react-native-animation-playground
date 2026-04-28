import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Line, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

import { FormattedItemWithIndex, Y_MARGIN } from '../utils';
import { Y_AXIS_LABELS_WIDTH } from './YAxisLabels';

interface CandlestickChartCandleProps {
  calculateCandleHeight: (size: number) => number;
  calculateYValue: (value: number) => number;
  candleWidth: number;
  currentPrice: SharedValue<FormattedItemWithIndex | null>;
  data: FormattedItemWithIndex;
  step: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function CandlestickChartCandle({
  calculateCandleHeight,
  calculateYValue,
  candleWidth,
  currentPrice,
  data,
  step,
}: CandlestickChartCandleProps) {
  const theme = useTheme();

  const { close, high, index, low, open } = data;
  const x = index * step;
  const max = Math.max(open ?? 0, close ?? 0);
  const min = Math.min(open ?? 0, close ?? 0);

  const candleHeight = calculateCandleHeight(max - min);

  const animatedLineProps = useAnimatedProps(() => {
    const isActive = index === currentPrice.get()?.index;

    const bgColor =
      !close || !open
        ? isActive
          ? theme.colors.green800
          : theme.colors.green500
        : close >= open
          ? isActive
            ? theme.colors.green800
            : theme.colors.green500
          : isActive
            ? theme.colors.red800
            : theme.colors.red500;

    return { stroke: bgColor };
  });

  const animatedRectProps = useAnimatedProps(() => {
    const isActive = index === currentPrice.get()?.index;

    const bgColor =
      !close || !open
        ? isActive
          ? theme.colors.green800
          : theme.colors.green500
        : close >= open
          ? isActive
            ? theme.colors.green800
            : theme.colors.green500
          : isActive
            ? theme.colors.red800
            : theme.colors.red500;

    return { fill: bgColor };
  });

  return (
    <>
      <AnimatedLine
        animatedProps={animatedLineProps}
        strokeWidth={2}
        transform={[
          { translateY: Y_MARGIN },
          { translateX: Y_AXIS_LABELS_WIDTH },
        ]}
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
            translateY: Y_MARGIN + calculateYValue(max),
          },
          {
            translateX: x + step / 2 - candleWidth / 2 + Y_AXIS_LABELS_WIDTH,
          },
        ]}
        width={candleWidth}
      />
    </>
  );
}

export default CandlestickChartCandle;
