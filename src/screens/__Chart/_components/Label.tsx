import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  AnimatedStyle,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';

interface Props extends Omit<TextInputProps, 'style' | 'text' | 'textAlign'> {
  style?: StyleProp<AnimatedStyle<TextStyle>>;
  text?: SharedValue<string>;
  // eslint-disable-next-line react/no-unused-prop-types
  value?: string;
}

const styles = StyleSheet.create({
  textInput: {
    fontSize: 10,
    height: 14,
    lineHeight: 14,
    paddingBottom: 0,
    paddingTop: 0,
    textAlign: 'center',
  },
});

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function BaseLabel({ style, value, ...props }: Props) {
  return (
    <View pointerEvents="none">
      <AnimatedTextInput style={style} value={value} {...props} />
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
    <View pointerEvents="none">
      <AnimatedTextInput
        allowFontScaling={false}
        animatedProps={animatedProps}
        editable={false}
        focusable={false}
        style={[styles.textInput, style]}
      />
    </View>
  );
}

export default Label;
