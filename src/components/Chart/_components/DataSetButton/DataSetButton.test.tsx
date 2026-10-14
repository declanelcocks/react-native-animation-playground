import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { createSharedValue } from '@/tests/sharedValue';

import { DataSetButton } from '.';
import {
  ChartTheme,
  ChartThemeContext,
  DEFAULT_CHART_THEME,
} from '../../utils/theme';

// The default mock's `interpolateColor` returns undefined.
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<object>('react-native-reanimated/mock'),
  interpolateColor: (progress: number, _input: number[], output: string[]) =>
    output[progress <= 0 ? 0 : 1],
}));

// Walks up from the label text to the pressable that carries the background.
const flatten = (style: unknown) =>
  (StyleSheet.flatten(style as StyleProp<ViewStyle>) as
    | Record<string, unknown>
    | undefined) ?? {};

const getBackground = () => {
  let node = screen.getByText('1W').parent;

  while (node && flatten(node.props.style).padding === undefined) {
    node = node.parent;
  }

  return flatten(node?.props.style).backgroundColor;
};

const renderButton = ({
  currentChartIndex = 0,
  onSelect = jest.fn(),
  theme = DEFAULT_CHART_THEME,
  transition = 1,
}: {
  currentChartIndex?: number;
  onSelect?: (index: number) => void;
  theme?: ChartTheme;
  transition?: number;
} = {}) => {
  render(
    <ChartThemeContext.Provider value={theme}>
      <DataSetButton
        currentChartIndex={createSharedValue(currentChartIndex)}
        index={0}
        label="1W"
        onSelect={onSelect}
        transition={createSharedValue(transition)}
      />
    </ChartThemeContext.Provider>,
  );

  return {
    background: getBackground(),
    textColor: flatten(screen.getByText('1W').props.style).color,
  };
};

describe('DataSetButton', () => {
  it('renders the label', () => {
    renderButton();

    expect(screen.getByText('1W')).toBeOnTheScreen();
  });

  it('calls onSelect with its index when pressed', () => {
    const onSelect = jest.fn();
    renderButton({ onSelect });

    fireEvent.press(screen.getByText('1W'));

    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('uses the active colours when it is the current data set', () => {
    const { background, textColor } = renderButton({ currentChartIndex: 0 });

    expect(background).toBe(DEFAULT_CHART_THEME.colors.buttonActive);
    expect(textColor).toBe(DEFAULT_CHART_THEME.colors.buttonTextActive);
  });

  it('uses the inactive colours when another data set is current', () => {
    const { background, textColor } = renderButton({ currentChartIndex: 1 });

    expect(background).toBe(DEFAULT_CHART_THEME.colors.buttonInactive);
    expect(textColor).toBe(DEFAULT_CHART_THEME.colors.buttonTextInactive);
  });

  it('starts from the opposite colours when the transition has not run', () => {
    const { background } = renderButton({
      currentChartIndex: 0,
      transition: 0,
    });

    expect(background).toBe(DEFAULT_CHART_THEME.colors.buttonInactive);
  });

  it('takes its colours from the theme', () => {
    const { background } = renderButton({
      theme: {
        ...DEFAULT_CHART_THEME,
        colors: { ...DEFAULT_CHART_THEME.colors, buttonActive: '#123456' },
      },
    });

    expect(background).toBe('#123456');
  });
});
