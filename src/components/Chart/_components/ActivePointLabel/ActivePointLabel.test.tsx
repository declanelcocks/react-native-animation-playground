import { render, screen } from '@testing-library/react-native';
import { TextInput } from 'react-native';

import { createSharedValue } from '@/tests/sharedValue';

import { ActivePointLabel } from '.';
import { BuiltChart, ChartPoint } from '../../utils/buildCharts';
import { noValueConstant } from '../../utils/formatters';

const point: ChartPoint = {
  formattedValue: '12.50',
  index: 1,
  label: 'Tuesday',
  value: 12.5,
};

const charts = [{ label: 'Week' }, { label: 'Month' }] as BuiltChart[];

const renderLabel = (activePoint: ChartPoint | null, chartIndex = 0) => {
  render(
    <ActivePointLabel
      activePoint={createSharedValue(activePoint)}
      chartIndex={createSharedValue(chartIndex)}
      charts={charts}
    />,
  );

  return screen
    .UNSAFE_getAllByType(TextInput)
    .map((input) => (input.props.animatedProps as { text: string }).text);
};

describe('ActivePointLabel', () => {
  it('shows the value, data set label and point label', () => {
    expect(renderLabel(point, 1)).toEqual(['12.50', 'Month', 'Tuesday']);
  });

  it('shows the no value constant and no point label without an active point', () => {
    expect(renderLabel(null)).toEqual([noValueConstant, 'Week', '']);
  });

  it('falls back to an empty data set label for an unknown chart index', () => {
    expect(renderLabel(point, 5)).toEqual(['12.50', '', 'Tuesday']);
  });
});
