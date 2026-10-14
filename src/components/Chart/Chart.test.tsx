import { act, render, screen } from '@testing-library/react-native';
import { State } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import Chart from './Chart';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-require-imports */

// The reanimated mock creates a fresh shared value on every render, so any
// re-render (such as picking a data set) would reset them all. Keep one per
// hook call, like the real thing.
jest.mock('react-native-reanimated', () => {
  const { useRef } = require('react');
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useSharedValue: (init: unknown) => {
      const ref = useRef(null);
      ref.current ??= actual.useSharedValue(init);
      return ref.current;
    },
  };
});

// Props the Chart passes to each (mocked) child, keyed by component name. The
// reanimated mock doesn't make derived values / animated styles reactive, so
// the shared values passed down are the observable output of the gestures.
const mockProps: Record<string, any> = {};

function mockRecord(name: string, props: unknown) {
  mockProps[name] = props;
}

jest.mock('./_components/ActivePointLabel', () => {
  const { View } = require('react-native');
  function Mock(props: object) {
    mockRecord('ActivePointLabel', props);
    return <View testID="active-point-label" />;
  }
  return { __esModule: true, ActivePointLabel: Mock, default: Mock };
});

// Function declarations: jest.mock factories run before `const`s are set.
function mockChartContainer(name: string) {
  const { Text, View } = require('react-native');

  const { useChartTheme } = require('./utils/theme');
  function Mock(props: any) {
    const { children } = props;
    mockRecord(name, props);
    return (
      <View testID={name}>
        <Text testID={`${name}-yAxisWidth`}>
          {String(useChartTheme().layout.yAxisWidth)}
        </Text>
        {children}
      </View>
    );
  }
  return { __esModule: true, default: Mock, [name]: Mock };
}

function mockLeaf(name: string) {
  const { View } = require('react-native');
  function Mock(props: object) {
    mockRecord(name, props);
    return <View testID={name} />;
  }
  return { __esModule: true, default: Mock, [name]: Mock };
}

jest.mock('./_components/LineChart', () => mockChartContainer('LineChart'));
jest.mock('./_components/BarChart', () => mockChartContainer('BarChart'));
jest.mock('./_components/CandlestickChart', () =>
  mockChartContainer('CandlestickChart'),
);
jest.mock('./_components/ScrollableBarChart', () =>
  mockLeaf('ScrollableBarChart'),
);
jest.mock('./_components/LineChartCursor', () => mockLeaf('LineChartCursor'));
jest.mock('./_components/CrosshairCursor', () => mockLeaf('CrosshairCursor'));

const formatPounds = (value: number) => `£${value}`;
const SIZE = { height: 100, width: 232 };
// yAxisWidth 32: the plot starts at x=32 and is 200 wide. With 4 points a
// stepped chart has 50-wide steps, a line has points at 32, 98.7, 165.3, 232.
const points = [10, 20, 30, 40].map((value) => ({ label: `p${value}`, value }));
const candles = [1, 2, 3, 4].map((close) => ({
  close,
  high: close + 1,
  label: `c${close}`,
  low: close - 1,
  open: close,
}));
const dataSets = [
  { data: points, label: 'Week' },
  { data: points.slice(0, 2), label: 'Month' },
  { data: [], label: 'Empty' },
];

const renderLine = (props: object = {}) =>
  render(<Chart {...SIZE} dataSets={dataSets} type="line" {...props} />);
const renderBar = (props: object = {}) =>
  render(<Chart {...SIZE} dataSets={dataSets} type="bar" {...props} />);

const activePoint = () => mockProps.ActivePointLabel.activePoint.get();
const lineTranslation = () => ({
  x: mockProps.LineChartCursor.translation.x.get(),
  y: mockProps.LineChartCursor.translation.y.get(),
});
const steppedTranslation = () => ({
  x: mockProps.CrosshairCursor.translation.x.get(),
  y: mockProps.CrosshairCursor.translation.y.get(),
});
const isCursorActive = (cursor: 'CrosshairCursor' | 'LineChartCursor') =>
  mockProps[cursor].isCursorActive.get() as boolean;

// The label sits under `pointerEvents: 'none'`, which `fireEvent.press` treats
// as unpressable, so call the nearest `onPress` up the tree directly.
const press = (label: string) => {
  let node: null | ReturnType<typeof screen.getByText> =
    screen.getByText(label);
  while (node && !node.props.onPress) node = node.parent;
  act(() => {
    node?.props.onPress();
  });
};

type PanCallbacks = Record<
  'onBegin' | 'onFinalize' | 'onUpdate',
  (event: { x: number; y: number }) => void
>;
// fireGestureHandler always runs a gesture BEGAN -> ACTIVE -> END, so it can't
// show a mid-gesture state. Calling the callbacks directly can.
const pan = (testID: 'line-pan' | 'stepped-pan') =>
  (getByGestureTestId(testID) as unknown as { handlers: PanCallbacks })
    .handlers;

beforeEach(() => {
  for (const key of Object.keys(mockProps))
    Reflect.deleteProperty(mockProps, key);
});

describe('Chart', () => {
  describe('chart type', () => {
    it('renders a line chart with a pannable line cursor', () => {
      renderLine();

      expect(screen.getByTestId('LineChart')).toBeOnTheScreen();
      expect(screen.getByTestId('LineChartCursor')).toBeOnTheScreen();
      expect(getByGestureTestId('line-pan')).toBeTruthy();
      expect(screen.queryByTestId('BarChart')).toBeNull();
      expect(screen.queryByTestId('CrosshairCursor')).toBeNull();
      expect(screen.queryByTestId('ScrollableBarChart')).toBeNull();
    });

    it('renders a bar chart with a pannable crosshair cursor', () => {
      renderBar();

      expect(screen.getByTestId('BarChart')).toBeOnTheScreen();
      expect(screen.getByTestId('CrosshairCursor')).toBeOnTheScreen();
      expect(getByGestureTestId('stepped-pan')).toBeTruthy();
      expect(screen.queryByTestId('LineChart')).toBeNull();
      expect(screen.queryByTestId('LineChartCursor')).toBeNull();
    });

    it('renders a candlestick chart with a pannable crosshair cursor', () => {
      render(
        <Chart
          {...SIZE}
          dataSets={[{ data: candles, label: 'Candles' }]}
          type="candlestick"
        />,
      );

      expect(screen.getByTestId('CandlestickChart')).toBeOnTheScreen();
      expect(screen.getByTestId('CrosshairCursor')).toBeOnTheScreen();
      expect(getByGestureTestId('stepped-pan')).toBeTruthy();
      expect(screen.queryByTestId('BarChart')).toBeNull();
    });

    it('renders a scrollable bar chart without a pan gesture or cursor', () => {
      render(<Chart {...SIZE} dataSets={dataSets} type="bar-scrollable" />);

      expect(screen.getByTestId('ScrollableBarChart')).toBeOnTheScreen();
      expect(() => getByGestureTestId('stepped-pan')).toThrow();
      expect(() => getByGestureTestId('line-pan')).toThrow();
      expect(screen.queryByTestId('CrosshairCursor')).toBeNull();
    });
  });

  describe('initial state', () => {
    it('parks the line cursor on the last point', () => {
      renderLine();

      expect(activePoint()).toMatchObject({
        formattedValue: '40.00',
        index: 3,
      });
      expect(lineTranslation().x).toBe(232);
      expect(isCursorActive('LineChartCursor')).toBe(false);
    });

    it('parks the stepped cursor on the centre of the last step', () => {
      renderBar();

      expect(activePoint()).toMatchObject({ index: 3, value: 40 });
      expect(steppedTranslation()).toEqual({ x: 207, y: 0 });
    });

    it('builds one chart per data set and passes them down', () => {
      renderLine();

      const { charts } = mockProps.LineChart;
      expect(charts.map((c: { label: string }) => c.label)).toEqual([
        'Week',
        'Month',
        'Empty',
      ]);
      expect(mockProps.ActivePointLabel.charts).toBe(charts);
    });
  });

  describe('data set buttons', () => {
    it('renders one button per data set', () => {
      renderLine();

      for (const label of ['Week', 'Month', 'Empty']) {
        expect(screen.getByText(label)).toBeOnTheScreen();
      }
    });

    it('switches the data set and active point, and animates, on press', () => {
      renderLine();
      const { currentChartIndex, previousChartIndex, transition } =
        mockProps.LineChart;

      press('Month');

      expect(previousChartIndex.get()).toBe(0);
      expect(currentChartIndex.get()).toBe(1);
      expect(mockProps.ActivePointLabel.chartIndex).toBe(currentChartIndex);
      // withTiming is mocked to resolve to its target immediately.
      expect(transition.get()).toBe(1);
      // The last point of the 2-point set.
      expect(activePoint()).toMatchObject({
        formattedValue: '20.00',
        index: 1,
      });
      expect(lineTranslation().x).toBe(232);
    });

    it('re-renders bar charts with the selected chart', () => {
      renderBar();

      press('Month');

      expect(mockProps.BarChart.chart).toBe(mockProps.BarChart.charts[1]);
      expect(activePoint()).toMatchObject({ index: 1, value: 20 });
      // Two 100-wide steps: the last is centred on 32 + 100 + 50.
      expect(steppedTranslation().x).toBe(182);
    });

    it('ignores a press on the selected data set', () => {
      renderLine();
      const { previousChartIndex } = mockProps.LineChart;
      previousChartIndex.set(5);

      press('Week');

      expect(previousChartIndex.get()).toBe(5);
    });

    it('hides the chart and clears the active point for an empty data set', () => {
      renderLine();

      press('Empty');

      expect(mockProps.LineChart.currentChartIndex.get()).toBe(2);
      expect(activePoint()).toBeNull();
      expect(lineTranslation()).toEqual({ x: 232, y: 0 });
    });

    it('clears the active point for an empty stepped data set', () => {
      renderBar();

      press('Empty');

      expect(activePoint()).toBeNull();
      expect(mockProps.BarChart.chart.data).toEqual([]);
    });
  });

  describe('line gesture', () => {
    it('activates the cursor on begin and moves it along the line', () => {
      renderLine();

      act(() => {
        pan('line-pan').onBegin({ x: 32, y: 10 });
      });

      expect(isCursorActive('LineChartCursor')).toBe(true);
      expect(lineTranslation().x).toBe(32);
      expect(activePoint()).toMatchObject({ index: 0, value: 10 });
    });

    it('moves the cursor y to the line at x', () => {
      renderLine();

      pan('line-pan').onBegin({ x: 32, y: 0 });
      const startY = lineTranslation().y as number;
      pan('line-pan').onUpdate({ x: 232, y: 0 });

      // Values rise, so the cursor ends up higher (smaller y) than it starts.
      expect(lineTranslation().y).toBeLessThan(startY);
    });

    it('follows the pan on update, clamped to the plot', () => {
      renderLine();
      pan('line-pan').onBegin({ x: 100, y: 10 });

      pan('line-pan').onUpdate({ x: 170, y: 10 });
      expect(lineTranslation().x).toBe(170);
      expect(activePoint().index).toBe(2);

      pan('line-pan').onUpdate({ x: 5, y: 10 });
      expect(lineTranslation().x).toBe(32);
      expect(activePoint().index).toBe(0);

      pan('line-pan').onUpdate({ x: 500, y: 10 });
      expect(lineTranslation().x).toBe(232);
      expect(activePoint().index).toBe(3);
    });

    it('ignores negative x', () => {
      renderLine();

      pan('line-pan').onBegin({ x: -5, y: 0 });
      pan('line-pan').onUpdate({ x: -5, y: 0 });

      expect(isCursorActive('LineChartCursor')).toBe(false);
      expect(lineTranslation().x).toBe(232);
    });

    it('resets the cursor to the last point on finalize', () => {
      renderLine();
      pan('line-pan').onBegin({ x: 32, y: 0 });

      pan('line-pan').onFinalize({ x: 32, y: 0 });

      expect(isCursorActive('LineChartCursor')).toBe(false);
      expect(lineTranslation().x).toBe(232);
      expect(activePoint()).toMatchObject({ index: 3, value: 40 });
    });

    it('runs the full lifecycle when fired through gesture-handler', () => {
      renderLine();

      fireGestureHandler(getByGestureTestId('line-pan'), [
        { state: State.BEGAN, x: 32, y: 0 },
        { state: State.ACTIVE, x: 60, y: 0 },
        { state: State.END, x: 60, y: 0 },
      ]);

      // END finalizes the gesture, parking the cursor on the last point.
      expect(isCursorActive('LineChartCursor')).toBe(false);
      expect(lineTranslation().x).toBe(232);
      expect(activePoint()).toMatchObject({ index: 3, value: 40 });
    });

    it('moves along the currently selected data set', () => {
      renderLine();
      press('Month');

      pan('line-pan').onBegin({ x: 232, y: 0 });

      expect(activePoint()).toMatchObject({ index: 1, value: 20 });
    });
  });

  describe('stepped gesture', () => {
    it('activates the cursor and snaps to the step centre', () => {
      renderBar();

      pan('stepped-pan').onBegin({ x: 100, y: 40 });

      // Steps are 50 wide from x=32: x=100 is in step 1, centred on 107.
      expect(isCursorActive('CrosshairCursor')).toBe(true);
      expect(steppedTranslation()).toEqual({ x: 107, y: 40 });
      expect(activePoint()).toMatchObject({ index: 1, value: 20 });
    });

    it('updates as the pan moves and clamps x and y', () => {
      renderBar();
      pan('stepped-pan').onBegin({ x: 100, y: 40 });

      pan('stepped-pan').onUpdate({ x: 500, y: 500 });
      expect(steppedTranslation()).toEqual({ x: 207, y: SIZE.height });
      expect(activePoint().index).toBe(3);

      pan('stepped-pan').onUpdate({ x: 10, y: -20 });
      expect(steppedTranslation()).toEqual({ x: 57, y: 0 });
      expect(activePoint().index).toBe(0);
    });

    it('ignores negative x', () => {
      renderBar();

      pan('stepped-pan').onBegin({ x: -1, y: 40 });
      pan('stepped-pan').onUpdate({ x: -1, y: 40 });

      expect(isCursorActive('CrosshairCursor')).toBe(false);
      expect(steppedTranslation().x).toBe(207);
    });

    it('resets to the last step on finalize, keeping y', () => {
      renderBar();
      pan('stepped-pan').onBegin({ x: 40, y: 40 });

      pan('stepped-pan').onFinalize({ x: 40, y: 40 });

      expect(isCursorActive('CrosshairCursor')).toBe(false);
      expect(steppedTranslation()).toEqual({ x: 207, y: 40 });
      expect(activePoint()).toMatchObject({ index: 3, value: 40 });
    });

    it('snaps relative to the plot start with labels on the right', () => {
      renderBar({ labelsPosition: 'right' });

      // Steps start at x=0 and are 50 wide.
      pan('stepped-pan').onBegin({ x: 60, y: 10 });

      expect(steppedTranslation().x).toBe(75);
      expect(activePoint().index).toBe(1);
    });

    it('also drives the candlestick cursor', () => {
      render(
        <Chart
          {...SIZE}
          dataSets={[{ data: candles, label: 'Candles' }]}
          type="candlestick"
        />,
      );

      pan('stepped-pan').onBegin({ x: 60, y: 10 });

      expect(activePoint()).toMatchObject({ close: 1, index: 0 });
      expect(steppedTranslation()).toEqual({ x: 57, y: 10 });
    });
  });

  describe('options', () => {
    it('formats the readout and y-axis labels with formatValue', () => {
      renderLine({ formatValue: formatPounds });

      expect(activePoint().formattedValue).toBe('£40');
      const [{ yAxisLabels }] = mockProps.LineChart.charts;
      expect(yAxisLabels.length).toBeGreaterThan(0);
      for (const { value } of yAxisLabels as { value: string }[]) {
        expect(value).toMatch(/^£/);
      }
    });

    it('uses labelsPosition to place the cursor and chart bounds', () => {
      renderLine({ labelsPosition: 'right' });

      expect(mockProps.LineChart.labelsPosition).toBe('right');
      // The plot ends before the right-hand labels.
      expect(lineTranslation().x).toBe(200);
      expect(activePoint().index).toBe(3);

      pan('line-pan').onBegin({ x: 0, y: 0 });

      expect(lineTranslation().x).toBe(0);
      expect(activePoint().index).toBe(0);
    });

    it('provides the default theme to children', () => {
      renderLine();

      expect(screen.getByTestId('LineChart-yAxisWidth')).toHaveTextContent(
        '32',
      );
    });

    it('merges a theme override and provides it to children', () => {
      renderLine({ theme: { layout: { yAxisWidth: 48 } } });

      expect(screen.getByTestId('LineChart-yAxisWidth')).toHaveTextContent(
        '48',
      );
      // The override also drives the geometry: the plot now starts at 48.
      pan('line-pan').onBegin({ x: 10, y: 0 });
      expect(lineTranslation().x).toBe(48);
    });
  });
});
