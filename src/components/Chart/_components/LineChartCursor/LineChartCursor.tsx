import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { Vector } from 'react-native-redash';

import { useChartTheme } from '../../utils/theme';

interface Props {
  currentTrend: Readonly<SharedValue<'negative' | 'positive'>>;
  height: number;
  isCursorActive: SharedValue<boolean>;
  translation: Vector<SharedValue<number>>;
  width: number;
}

export function LineChartCursor({
  currentTrend,
  height,
  isCursorActive,
  translation,
  width,
}: Props) {
  const theme = useChartTheme();
  const { cursorSize } = theme.layout;

  const trendColor = useDerivedValue(() =>
    currentTrend.get() === 'positive'
      ? theme.colors.positive
      : theme.colors.negative,
  );

  const cursorStyle = useAnimatedStyle(() => {
    const translateX = translation.x.get() - cursorSize / 2;
    const translateY = translation.y.get() - cursorSize / 2;

    return {
      backgroundColor: trendColor.get(),
      opacity: 1,
      transform: [{ translateX }, { translateY }],
    };
  });

  const verticalIndicatorStyle = useAnimatedStyle(() => {
    if (isCursorActive.get()) {
      const translateX = translation.x.get();

      return {
        backgroundColor: trendColor.get(),
        opacity: 1,
        transform: [{ translateX }],
      };
    }

    return {
      opacity: 0,
      transform: [{ translateX: 0 }],
    };
  });

  const horizontalIndicatorStyle = useAnimatedStyle(() => {
    if (isCursorActive.get()) {
      const translateY = translation.y.get();

      return {
        backgroundColor: trendColor.get(),
        opacity: 1,
        transform: [{ translateY }],
      };
    }

    return {
      opacity: 0,
      transform: [{ translateY: 0 }],
    };
  });

  return (
    <>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            borderRadius: cursorSize / 2,
            height: cursorSize,
            justifyContent: 'center',
            width: cursorSize,
          },
          cursorStyle,
        ]}
      />

      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            {
              height,
              width: 1,
            },
            verticalIndicatorStyle,
          ]}
        />
      </View>

      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            {
              height: 1,
              width,
            },
            horizontalIndicatorStyle,
          ]}
        />
      </View>
    </>
  );
}

export default LineChartCursor;
