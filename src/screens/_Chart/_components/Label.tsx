import { TextInput, View } from 'react-native';
import Animated, {
  AnimatedStyle,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

interface Props {
  style?: AnimatedStyle | AnimatedStyle[];
  text?: SharedValue<string>;
  value?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function Label({ style, text, ...props }: Props) {
  const theme = useTheme();

  const animatedProps = useAnimatedProps(() => {
    return {
      text: text?.value,
      value: text?.value,
    };
  });

  return (
    <View pointerEvents="none">
      <AnimatedTextInput
        {...props}
        {...{ animatedProps }}
        allowFontScaling={false}
        editable={false}
        focusable={false}
        style={[
          style,
          {
            color: theme.colors.gray400,
            fontSize: 10,
            height: 12,
            lineHeight: 12,
            paddingBottom: 0,
            paddingTop: 0,
            textAlign: 'center',
          },
        ]}
      />
    </View>
  );
}

export default Label;
