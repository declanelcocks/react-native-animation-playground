import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  AnimatedStyle,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';

interface Props extends Omit<TextInputProps, 'style' | 'text' | 'textAlign'> {
  style?: StyleProp<AnimatedStyle<StyleProp<TextStyle>>>;
  text?: SharedValue<string>;
  // eslint-disable-next-line react/no-unused-prop-types
  value?: string;
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    textAlign: 'center',
  },
});

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface BaseLabelProps extends Omit<TextProps, 'style'> {
  style?: StyleProp<AnimatedStyle<StyleProp<TextStyle>>>;
  text: string;
}

export function BaseLabel({ style, text, ...props }: BaseLabelProps) {
  return (
    <View pointerEvents="none" style={{ flexDirection: 'row' }}>
      <Animated.Text style={style} {...props}>
        {text}
      </Animated.Text>
    </View>
  );
}

export function Label({ style, text }: Props) {
  const animatedProps = useAnimatedProps(() => {
    return {
      defaultValue: text?.get(),
      text: text?.get(),
    };
  });

  return (
    <View pointerEvents="none" style={{ flexDirection: 'row' }}>
      <AnimatedTextInput
        allowFontScaling={false}
        animatedProps={animatedProps}
        editable={false}
        focusable={false}
        style={[styles.label, style]}
      />
    </View>
  );
}

export default Label;
