import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Vector } from 'react-native-redash';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme';

interface Props {
  height: number;
  isCursorActive: SharedValue<boolean>;
  translation: Vector<SharedValue<number>>;
  width: number;
}

export function CandlestickChartCursor({
  height,
  isCursorActive,
  translation,
  width,
}: Props) {
  const theme = useTheme();

  const horizontal = useAnimatedStyle(() => {
    if (isCursorActive.get()) {
      return {
        opacity: 1,
        transform: [{ translateY: translation.y.get() }],
      };
    }

    return {
      opacity: 0,
    };
  }, []);

  const vertical = useAnimatedStyle(() => {
    if (isCursorActive.get()) {
      return {
        opacity: 1,
        transform: [{ translateX: translation.x.get() }],
      };
    }

    return {
      opacity: 0,
    };
  }, []);

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, horizontal]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Line
            stroke={theme.colors.gray800}
            strokeDasharray="3 3"
            strokeWidth={2}
            x1={0}
            x2={width}
            y1={0}
            y2={0}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, vertical]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Line
            stroke={theme.colors.gray800}
            strokeDasharray="3 3"
            strokeWidth={2}
            x1={0}
            x2={0}
            y1={0}
            y2={height}
          />
        </Svg>
      </Animated.View>
    </>
  );
}

export default CandlestickChartCursor;
