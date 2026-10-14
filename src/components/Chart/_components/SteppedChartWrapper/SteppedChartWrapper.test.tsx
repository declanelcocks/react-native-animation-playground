import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { SteppedChartWrapper } from '.';
import { buildCharts } from '../../utils/buildCharts';
import { ChartThemeContext, DEFAULT_CHART_THEME } from '../../utils/theme';
import { BaseLabel } from '../Label';

const { mainCharts: charts } = buildCharts(
  { height: 100, width: 232 },
  {
    dataSets: [{ data: [{ value: 0 }, { value: 100 }], label: 'set' }],
    type: 'bar',
  },
  { formatValue: (value) => `v${value}`, yAxisWidth: 32 },
);

const labelCount = charts[0].yAxisLabels?.length ?? 0;

const renderWrapper = (
  props: Partial<React.ComponentProps<typeof SteppedChartWrapper>> = {},
) =>
  render(
    <SteppedChartWrapper
      charts={charts}
      currentChartIndex={createSharedValue(0)}
      height={100}
      plot={<Circle testID="plot" />}
      width={200}
      {...props}
    >
      <Text>child</Text>
    </SteppedChartWrapper>,
  );

// The label slots are the only views as wide as the y-axis column.
const labelLefts = () =>
  screen
    .UNSAFE_getAllByType(View)
    .map(
      ({ props }) =>
        (props as { style?: { left: number; width: number } }).style,
    )
    .filter((style) => style?.width === 32)
    .map((style) => style?.left);

describe('SteppedChartWrapper', () => {
  it('renders the y-axis labels', () => {
    renderWrapper();

    expect(labelCount).toBeGreaterThan(0);
    expect(screen.UNSAFE_getAllByType(BaseLabel)).toHaveLength(labelCount);
  });

  it('renders the grid lines and the plot inside the svg', () => {
    renderWrapper();

    const svg = screen.UNSAFE_getByType(Svg);

    expect(svg.findAll((node) => node.type === Line)).toHaveLength(labelCount);
    expect(
      svg.findAll((node) => node.props.testID === 'plot'),
    ).not.toHaveLength(0);
  });

  it('renders its children outside the svg', () => {
    renderWrapper();

    expect(screen.getByText('child')).toBeOnTheScreen();
    expect(
      screen.UNSAFE_getByType(Svg).findAll((node) => node.type === Text),
    ).toHaveLength(0);
  });

  it('sizes the svg with the theme margins', () => {
    renderWrapper();

    const { height, width } = screen.UNSAFE_getByType(Svg).props;
    const { xMargin, yMargin } = DEFAULT_CHART_THEME.layout;

    expect(width).toBe(200 + xMargin);
    expect(height).toBe(100 + yMargin * 2);
  });

  it('uses a custom theme for its margins', () => {
    render(
      <ChartThemeContext.Provider
        value={{
          ...DEFAULT_CHART_THEME,
          layout: { ...DEFAULT_CHART_THEME.layout, xMargin: 10, yMargin: 1 },
        }}
      >
        <SteppedChartWrapper
          charts={charts}
          currentChartIndex={createSharedValue(0)}
          height={100}
          plot={null}
          width={200}
        />
      </ChartThemeContext.Provider>,
    );

    expect(screen.UNSAFE_getByType(Svg).props.width).toBe(210);
    expect(screen.UNSAFE_getByType(Svg).props.height).toBe(102);
  });

  describe('labelsPosition', () => {
    it('puts the labels and grid lines on the left by default', () => {
      renderWrapper();

      const [line] = screen.UNSAFE_getAllByType(Line);

      expect(labelLefts()[0]).toBe(0);
      expect(line.props.x1).toBe(32);
      expect(line.props.x2).toBe(200);
    });

    it('puts the labels and grid lines on the right', () => {
      renderWrapper({ labelsPosition: 'right' });

      const [line] = screen.UNSAFE_getAllByType(Line);

      expect(labelLefts()[0]).toBe(200 - 32 + 4);
      expect(line.props.x1).toBe(0);
      expect(line.props.x2).toBe(200 - 32);
    });
  });

  it('renders without labels for an empty data set', () => {
    const { mainCharts: empty } = buildCharts(
      { height: 100, width: 232 },
      { dataSets: [{ data: [], label: 'empty' }], type: 'bar' },
      { formatValue: String, yAxisWidth: 32 },
    );

    renderWrapper({ charts: empty });

    expect(screen.UNSAFE_queryAllByType(BaseLabel)).toHaveLength(0);
    expect(screen.UNSAFE_queryAllByType(Line)).toHaveLength(0);
  });
});
