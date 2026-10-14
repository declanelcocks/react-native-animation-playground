import { render, screen } from '@testing-library/react-native';
import { Stop } from 'react-native-svg';

import { Gradient } from '.';
import { DEFAULT_CHART_THEME } from '../../utils/theme';

const stops = () => screen.UNSAFE_getAllByType(Stop);

describe('Gradient', () => {
  it('fades the positive colour out over three stops', () => {
    render(<Gradient id="g" trend="positive" />);

    expect(stops().map(({ props }) => props.stopColor as string)).toEqual(
      Array.from({ length: 3 }, () => DEFAULT_CHART_THEME.colors.positive),
    );
    expect(stops().map(({ props }) => props.stopOpacity as string)).toEqual([
      '0.6',
      '0.3',
      '0',
    ]);
  });

  it('uses the negative colour for a negative trend', () => {
    render(<Gradient id="g" trend="negative" />);

    expect(stops().map(({ props }) => props.stopColor as string)).toEqual(
      Array.from({ length: 3 }, () => DEFAULT_CHART_THEME.colors.negative),
    );
  });
});
