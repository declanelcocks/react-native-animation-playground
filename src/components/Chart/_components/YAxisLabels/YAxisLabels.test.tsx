import { render, screen } from '@testing-library/react-native';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Line } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { YAxisLabels, YAxisLines } from '.';
import { BuiltChart } from '../../utils/buildCharts';
import { DEFAULT_CHART_THEME } from '../../utils/theme';

const flatten = (style: unknown) =>
  (StyleSheet.flatten(style as StyleProp<ViewStyle>) as
    | Record<string, unknown>
    | undefined) ?? {};

const { yAxisWidth, yMargin } = DEFAULT_CHART_THEME.layout;
const WIDTH = 200;

const charts = [
  {
    yAxisLabels: [
      { value: '10.00', y: 0 },
      { value: '5.00', y: 50 },
    ],
  },
  { yAxisLabels: [{ value: '99.00', y: 20 }] },
  {},
] as BuiltChart[];

const renderLabels = (
  currentChartIndex: number,
  labelsPosition?: 'left' | 'right',
) =>
  render(
    <YAxisLabels
      charts={charts}
      currentChartIndex={createSharedValue(currentChartIndex)}
      labelsPosition={labelsPosition}
      width={WIDTH}
    />,
  );

// Walks up from the label text to the animated slot that carries the style.
const slotStyle = (text: string) => {
  let node = screen.getByText(text).parent;

  while (node && flatten(node.props.style).top === undefined) {
    node = node.parent;
  }

  return flatten(node?.props.style);
};

describe('YAxisLabels', () => {
  it('renders the labels of every data set', () => {
    renderLabels(0);

    for (const text of ['10.00', '5.00', '99.00']) {
      expect(screen.getByText(text)).toBeOnTheScreen();
    }
  });

  it('only shows the labels of the current chart', () => {
    renderLabels(1);

    expect(slotStyle('10.00').opacity).toBe(0);
    expect(slotStyle('5.00').opacity).toBe(0);
    expect(slotStyle('99.00').opacity).toBe(1);
  });

  it('positions each label from its y value', () => {
    renderLabels(0);

    expect(slotStyle('5.00')).toMatchObject({
      top: 50 + yMargin - 7,
      width: yAxisWidth,
    });
  });

  it('puts the labels on the left by default', () => {
    renderLabels(0);

    expect(slotStyle('10.00').left).toBe(0);
  });

  it('puts the labels on the right of the plot', () => {
    renderLabels(0, 'right');

    expect(slotStyle('10.00').left).toBe(WIDTH - yAxisWidth + 4);
  });

  it('ignores the pointer', () => {
    renderLabels(0);

    expect(screen.UNSAFE_getAllByType(View)[0].props.pointerEvents).toBe(
      'none',
    );
  });
});

describe('YAxisLines', () => {
  const renderLines = (
    currentChartIndex: number,
    labelsPosition?: 'left' | 'right',
  ) => {
    render(
      <YAxisLines
        charts={charts}
        currentChartIndex={createSharedValue(currentChartIndex)}
        labelsPosition={labelsPosition}
        width={WIDTH}
      />,
    );

    return screen.UNSAFE_getAllByType(Line);
  };

  it('renders a line for every label of every data set', () => {
    expect(renderLines(0)).toHaveLength(3);
  });

  it('only shows the lines of the current chart', () => {
    expect(
      renderLines(1).map(
        (line) => (line.props.animatedProps as { opacity: number }).opacity,
      ),
    ).toEqual([0, 0, 1]);
  });

  it('spans from after the labels to the right edge on the left', () => {
    const [line] = renderLines(0);

    expect(line.props).toMatchObject({
      stroke: DEFAULT_CHART_THEME.colors.gridLine,
      x1: yAxisWidth,
      x2: WIDTH,
      y1: 0,
      y2: 0,
    });
  });

  it('spans from the left edge to before the labels on the right', () => {
    const [line] = renderLines(0, 'right');

    expect(line.props).toMatchObject({ x1: 0, x2: WIDTH - yAxisWidth });
  });
});
