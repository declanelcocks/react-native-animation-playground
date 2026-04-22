import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Vector } from 'react-native-redash';

import { useTheme } from '@/theme';

const CURSOR_SIZE = 12;

const styles = StyleSheet.create({
  cursor: {
    alignItems: 'center',
    borderRadius: CURSOR_SIZE / 2,
    height: CURSOR_SIZE,
    justifyContent: 'center',
    width: CURSOR_SIZE,
  },
  cursorBody: {
    borderRadius: CURSOR_SIZE / 2,
    height: CURSOR_SIZE,
    width: CURSOR_SIZE,
  },
});

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
  const theme = useTheme();
  const cursorStyle = useAnimatedStyle(() => {
    if (!isCursorActive.value) {
      return { opacity: 0 };
    }

    const translateX = translation.x.value - CURSOR_SIZE / 2;
    const translateY = translation.y.value - CURSOR_SIZE / 2;

    return {
      backgroundColor:
        currentTrend.value === 'positive'
          ? theme.colors.green500
          : theme.colors.red500,
      opacity: 1,
      transform: [{ translateX }, { translateY }],
    };
  });

  const verticalIndicatorStyle = useAnimatedStyle(() => {
    if (isCursorActive.value) {
      const translateX = translation.x.value;

      return {
        backgroundColor:
          currentTrend.value === 'positive'
            ? theme.colors.green500
            : theme.colors.red500,
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
    if (isCursorActive.value) {
      const translateY = translation.y.value;

      return {
        backgroundColor:
          currentTrend.value === 'positive'
            ? theme.colors.green500
            : theme.colors.red500,
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
      <Animated.View style={[styles.cursor, cursorStyle]} />

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
