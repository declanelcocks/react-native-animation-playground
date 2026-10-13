import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useChartTheme } from '../theme';
import { BaseLabel } from './Label';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  currentChartIndex: SharedValue<number>;
  index: number;
  label: string;
  onSelect: (index: number) => void;
  transition: SharedValue<number>;
}

export function DataSetButton({
  currentChartIndex,
  index,
  label,
  onSelect,
  transition,
}: Props) {
  const theme = useChartTheme();

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      transition.get(),
      [0, 1],
      [
        currentChartIndex.get() === index
          ? theme.colors.buttonInactive
          : theme.colors.buttonActive,
        currentChartIndex.get() === index
          ? theme.colors.buttonActive
          : theme.colors.buttonInactive,
      ],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      transition.get(),
      [0, 1],
      [
        currentChartIndex.get() === index
          ? theme.colors.buttonTextInactive
          : theme.colors.buttonTextActive,
        currentChartIndex.get() === index
          ? theme.colors.buttonTextActive
          : theme.colors.buttonTextInactive,
      ],
    ),
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        onSelect(index);
      }}
      style={[buttonStyle, { borderRadius: 8, padding: 16 }]}
    >
      <BaseLabel
        style={[
          labelStyle,
          { fontSize: 16, fontWeight: 'bold', lineHeight: 24 },
        ]}
        text={label}
      />
    </AnimatedPressable>
  );
}

export default DataSetButton;
