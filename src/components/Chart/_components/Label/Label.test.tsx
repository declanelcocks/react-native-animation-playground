import { render, screen } from '@testing-library/react-native';
import { TextInput } from 'react-native';

import { createSharedValue } from '@/tests/sharedValue';

import { BaseLabel, Label } from '.';

describe('Label', () => {
  describe('BaseLabel', () => {
    it('renders the text', () => {
      render(<BaseLabel text="Hello" />);

      expect(screen.getByText('Hello')).toBeOnTheScreen();
    });

    it('passes extra text props through', () => {
      render(<BaseLabel numberOfLines={1} testID="base" text="Hello" />);

      expect(screen.getByTestId('base').props.numberOfLines).toBe(1);
    });
  });

  describe('Label', () => {
    it('shows the shared value as read-only text', () => {
      render(<Label text={createSharedValue('12.00')} />);

      const input = screen.UNSAFE_getByType(TextInput);

      expect(input.props.animatedProps).toEqual({
        defaultValue: '12.00',
        text: '12.00',
      });
      expect(input.props.editable).toBe(false);
      expect(input.props.focusable).toBe(false);
    });

    it('does not scale with the system font size', () => {
      render(<Label text={createSharedValue('12.00')} />);

      expect(screen.UNSAFE_getByType(TextInput).props.allowFontScaling).toBe(
        false,
      );
    });
  });
});
