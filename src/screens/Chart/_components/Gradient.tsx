import { Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

interface Props {
  /** Referenced from `fill="url(#id)"`; must be unique within the page. */
  id: string;
  trend: 'negative' | 'positive';
}

export function Gradient({ id, trend }: Props) {
  const theme = useTheme();

  return (
    <Defs>
      <LinearGradient id={id} x1="50%" x2="50%" y1="0%" y2="100%">
        <Stop
          offset="0%"
          stopColor={
            trend === 'positive' ? theme.colors.green500 : theme.colors.red500
          }
          stopOpacity="0.6"
        />
        <Stop
          offset="50%"
          stopColor={
            trend === 'positive' ? theme.colors.green500 : theme.colors.red500
          }
          stopOpacity="0.3"
        />
        <Stop
          offset="100%"
          stopColor={
            trend === 'positive' ? theme.colors.green500 : theme.colors.red500
          }
          stopOpacity="0"
        />
      </LinearGradient>
    </Defs>
  );
}

export default Gradient;
