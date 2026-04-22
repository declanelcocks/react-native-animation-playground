import { Platform, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { BaseLabel } from './Label';

interface Props {
  currentIndex: SharedValue<number>;
  index: number;
  onPress: (index: number) => void;
  text: string;
}

export function TimeSliceButton({ currentIndex, index, onPress, text }: Props) {
  const theme = useTheme();
  const isActive = useDerivedValue(() => {
    return currentIndex.value === index;
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isActive.value
        ? theme.colors.purple500
        : theme.colors.gray200,
      borderRadius: 16,
      padding: 10,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: (isActive.value ? '#fff' : theme.colors.gray800) as string,
      fontWeight: isActive.value ? 'bold' : 'normal',
      textAlign: 'center',
      ...(Platform.OS === 'ios' && { paddingBottom: 10 }),
    };
  });

  return (
    <View style={{ flex: 1, paddingHorizontal: 4 }}>
      <Pressable
        onPress={() => {
          onPress(index);
        }}
      >
        <Animated.View style={containerStyle}>
          <View pointerEvents="none">
            <BaseLabel style={textStyle} value={text} />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default TimeSliceButton;
