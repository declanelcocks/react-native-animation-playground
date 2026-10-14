import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { serialize } from 'react-native-redash';
import { LinearGradient, Path } from 'react-native-svg';

import { createSharedValue } from '@/tests/sharedValue';

import { LineChart } from '.';
import { buildCharts, BuiltChart } from '../../utils/buildCharts';
import { ChartThemeContext, DEFAULT_CHART_THEME } from '../../utils/theme';
import { Gradient } from '../Gradient';

type TestNode = ReturnType<typeof screen.UNSAFE_getByType>;

const animated = (node: TestNode) =>
  (node.props as { animatedProps: Record<string, unknown> }).animatedProps;

// The reanimated mock stubs `interpolate` and `interpolateColor` out, and
// redash's `interpolatePath` builds on `interpolate`. Use linear stand-ins.
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<object>('react-native-reanimated/mock'),
  interpolate: (
    value: number,
    [inMin, inMax]: number[],
    [from, to]: number[],
  ) =>
    from +
    (Math.min(Math.max(value, inMin), inMax) - inMin) *
      ((to - from) / (inMax - inMin)),
  interpolateColor: (value: number, _input: number[], [from, to]: string[]) =>
    value >= 1 ? to : from,
}));

jest.mock('react-native-redash', () => {
  const actual = jest.requireActual<typeof import('react-native-redash')>(
    'react-native-redash',
  );

  return {
    ...actual,
    interpolatePath: (value: number, _input: number[], [from, to]: never[]) =>
      actual.serialize(value >= 1 ? to : from),
  };
});

const { colors, layout } = DEFAULT_CHART_THEME;
const size = { height: 100, width: 232 };

const build = (...sets: number[][]): BuiltChart[] =>
  buildCharts(
    size,
    {
      dataSets: sets.map((values, i) => ({
        data: values.map((value) => ({ value })),
        label: `set ${i}`,
      })),
      type: 'line',
    },
    { formatValue: String, yAxisWidth: layout.yAxisWidth },
  ).mainCharts;

type Trend = 'negative' | 'positive';

const renderLine = ({
  charts,
  currentIndex = 0,
  currentTrend = 'positive',
  previousIndex = currentIndex,
  previousTrend,
  transition = 1,
  ...props
}: {
  charts: BuiltChart[];
  currentIndex?: number;
  currentTrend?: Trend;
  labelsPosition?: 'left' | 'right';
  previousIndex?: number;
  previousTrend?: Trend;
  transition?: number;
}) =>
  render(
    <LineChart
      charts={charts}
      currentChartIndex={createSharedValue(currentIndex)}
      currentTrend={createSharedValue(currentTrend)}
      height={size.height}
      previousChartIndex={createSharedValue(previousIndex)}
      previousTrend={
        previousTrend ? createSharedValue(previousTrend) : undefined
      }
      transition={createSharedValue(transition)}
      width={size.width}
      {...props}
    />,
  );

const getGradientIds = () =>
  screen
    .UNSAFE_getAllByType(Gradient)
    .map(({ props }) => (props as { id: string }).id);

// The line, the negative gradient fill and the positive gradient fill.
const getPaths = () => {
  const [line, negative, positive] = screen.UNSAFE_getAllByType(Path);

  return { line, negative, positive };
};

describe('LineChart', () => {
  it('draws the line, and a fill per trend', () => {
    renderLine({ charts: build([1, 3, 2]) });

    expect(screen.UNSAFE_getAllByType(Path)).toHaveLength(3);
  });

  it('draws the path of the current chart', () => {
    const charts = build([1, 3, 2], [5, 1, 4, 2]);
    renderLine({ charts, currentIndex: 1 });

    expect(animated(getPaths().line).d).toBe(serialize(charts[1].path));
  });

  it('closes the fills down to the bottom of the plot', () => {
    const charts = build([1, 3, 2]);
    renderLine({ charts });

    const { d } = animated(getPaths().positive);

    expect(d).toBe(
      `${serialize(charts[0].path)} L ${size.width} ${size.height} L ${layout.yAxisWidth} ${size.height}`,
    );
  });

  it('closes the fills against the right edge of the plot when the labels are on the right', () => {
    renderLine({ charts: build([1, 3, 2]), labelsPosition: 'right' });

    expect(animated(getPaths().negative).d).toMatch(
      new RegExp(
        `L ${size.width - layout.yAxisWidth} ${size.height} L 0 ${size.height}$`,
      ),
    );
  });

  describe('gradients', () => {
    it('renders a gradient per trend, with unique ids', () => {
      renderLine({ charts: build([1, 3, 2]) });

      const ids = getGradientIds();

      expect(
        screen
          .UNSAFE_getAllByType(Gradient)
          .map(({ props }) => (props as { trend: Trend }).trend),
      ).toEqual(['positive', 'negative']);
      expect(new Set(ids).size).toBe(2);
      expect(ids.every((id) => /^[\w-]+$/.test(id))).toBe(true);
      expect(screen.UNSAFE_getAllByType(LinearGradient)).toHaveLength(2);
    });

    it('fills the paths with the matching gradients', () => {
      renderLine({ charts: build([1, 3, 2]) });

      const [positive, negative] = getGradientIds();
      const paths = getPaths();

      expect(paths.positive.props.fill).toBe(`url(#${positive})`);
      expect(paths.negative.props.fill).toBe(`url(#${negative})`);
    });

    it('gives each chart its own ids', () => {
      const charts = build([1, 3, 2]);
      const chart = (
        <LineChart
          charts={charts}
          currentChartIndex={createSharedValue(0)}
          currentTrend={createSharedValue<Trend>('positive')}
          height={size.height}
          previousChartIndex={createSharedValue(0)}
          transition={createSharedValue(1)}
          width={size.width}
        />
      );

      render(
        <>
          {chart}
          {chart}
        </>,
      );

      const ids = getGradientIds();

      expect(ids).toHaveLength(4);
      expect(new Set(ids).size).toBe(4);
    });
  });

  describe('trend', () => {
    it('shows the positive fill for a positive trend', () => {
      renderLine({ charts: build([1, 3, 2]), currentTrend: 'positive' });

      expect(animated(getPaths().positive).opacity).toBe(1);
      expect(animated(getPaths().negative).opacity).toBe(0);
    });

    it('shows the negative fill for a negative trend', () => {
      renderLine({ charts: build([3, 1]), currentTrend: 'negative' });

      expect(animated(getPaths().positive).opacity).toBe(0);
      expect(animated(getPaths().negative).opacity).toBe(1);
    });

    it('colours the line by the current chart trend', () => {
      renderLine({ charts: build([3, 1]), currentTrend: 'negative' });

      expect(animated(getPaths().line).stroke).toBe(colors.negative);
    });

    it('cross-fades the fills when the trend changes between data sets', () => {
      const charts = build([1, 3], [3, 1]);
      const props = {
        charts,
        currentIndex: 1,
        currentTrend: 'negative' as const,
        previousIndex: 0,
        previousTrend: 'positive' as const,
      };

      renderLine({ ...props, transition: 0 });
      expect(animated(getPaths().negative).opacity).toBe(0);
      expect(animated(getPaths().positive).opacity).toBe(1);
      screen.unmount();

      renderLine({ ...props, transition: 1 });
      expect(animated(getPaths().negative).opacity).toBe(1);
      expect(animated(getPaths().positive).opacity).toBe(0);
    });
  });

  describe('empty data set', () => {
    it('draws nothing and falls back to the positive colour', () => {
      renderLine({ charts: build([]) });

      const { line, negative, positive } = getPaths();

      expect(animated(line)).toEqual({
        d: '',
        stroke: colors.positive,
      });
      expect(animated(negative).d).toBe('');
      expect(animated(positive).d).toBe('');
    });

    it('draws nothing for a single point', () => {
      renderLine({ charts: build([5]) });

      expect(animated(getPaths().line).d).toBe('');
    });
  });

  it('uses the positive colour from a custom theme for an empty chart', () => {
    render(
      <ChartThemeContext.Provider
        value={{
          ...DEFAULT_CHART_THEME,
          colors: { ...colors, positive: '#00ff00' },
        }}
      >
        <LineChart
          charts={build([])}
          currentChartIndex={createSharedValue(0)}
          currentTrend={createSharedValue<Trend>('positive')}
          height={size.height}
          previousChartIndex={createSharedValue(0)}
          transition={createSharedValue(1)}
          width={size.width}
        />
      </ChartThemeContext.Provider>,
    );

    expect(animated(getPaths().line).stroke).toBe('#00ff00');
  });

  it('renders its children', () => {
    render(
      <LineChart
        charts={build([1, 2])}
        currentChartIndex={createSharedValue(0)}
        currentTrend={createSharedValue<Trend>('positive')}
        height={size.height}
        previousChartIndex={createSharedValue(0)}
        transition={createSharedValue(1)}
        width={size.width}
      >
        <Text>child</Text>
      </LineChart>,
    );

    expect(screen.getByText('child')).toBeOnTheScreen();
  });
});
