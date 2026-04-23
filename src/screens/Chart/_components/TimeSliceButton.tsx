import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { BaseLabel } from './Label';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  currentChartIndex: SharedValue<number>;
  onChangeTimeSlice: (index: number) => void;
  timeSliceIndex: number;
  timeSliceLabel: string;
  transition: SharedValue<number>;
}

export function TimeSliceButton({
  currentChartIndex,
  onChangeTimeSlice,
  timeSliceIndex,
  timeSliceLabel,
  transition,
}: Props) {
  const theme = useTheme();

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      transition.get(),
      [0, 1],
      [
        currentChartIndex.get() === timeSliceIndex
          ? theme.colors.gray200
          : theme.colors.purple500,
        currentChartIndex.get() === timeSliceIndex
          ? theme.colors.purple500
          : theme.colors.gray200,
      ],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      transition.get(),
      [0, 1],
      [
        currentChartIndex.get() === timeSliceIndex
          ? theme.colors.gray400
          : theme.colors.white,
        currentChartIndex.get() === timeSliceIndex
          ? theme.colors.white
          : theme.colors.gray400,
      ],
    ),
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        onChangeTimeSlice(timeSliceIndex);
      }}
      style={[buttonStyle, { borderRadius: 8, padding: 16 }]}
    >
      <BaseLabel
        style={[
          labelStyle,
          { fontSize: 16, fontWeight: 'bold', lineHeight: 24 },
        ]}
        text={timeSliceLabel}
      />
    </AnimatedPressable>
  );
}

export default TimeSliceButton;
