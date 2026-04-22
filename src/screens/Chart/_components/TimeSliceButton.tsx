import { Platform, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import Label from './Label';

interface Props {
  currentIndex: SharedValue<number>;
  index: number;
  onPress: (index: number) => void;
  text: string;
  variant: 'box' | 'solid';
}

export function TimeSliceButton({
  currentIndex,
  index,
  onPress,
  text,
  variant,
}: Props) {
  const theme = useTheme();
  const isActive = useDerivedValue(() => currentIndex.value === index);

  const containerStyle = useAnimatedProps(() => {
    return {
      ...(variant === 'box' && {
        borderBottomColor: isActive.value
          ? theme.colors.purple100
          : theme.colors.gray400,
        borderBottomWidth: 2,
        paddingBottom: 10,
      }),
      ...(variant === 'solid' && {
        backgroundColor: isActive.value
          ? theme.colors.purple100
          : theme.colors.gray800,
        borderRadius: 16,
      }),
    };
  }, [isActive.value]);

  const textStyle = useAnimatedStyle(() => {
    return {
      ...(variant === 'box' && {
        color: (isActive.value
          ? theme.colors.purple100
          : theme.colors.gray400) as string,
        fontWeight: isActive.value ? 'bold' : 'normal',
      }),
      ...(variant === 'solid' && {
        color: (isActive.value ? '#fff' : theme.colors.gray400) as string,
        fontWeight: isActive.value ? 'bold' : 'normal',
        ...(Platform.OS === 'ios' && { paddingBottom: 10 }),
      }),
    };
  }, [isActive.value]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 4 }}>
      <Pressable
        onPress={() => {
          onPress(index);
        }}
      >
        <Animated.View style={containerStyle}>
          <View pointerEvents="none">
            <Label style={[textStyle, { textAlign: 'center' }]} value={text} />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default TimeSliceButton;
