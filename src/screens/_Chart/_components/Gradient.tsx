import { Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

interface Props {
  trend: 'negative' | 'positive';
}

export function Gradient({ trend }: Props) {
  const theme = useTheme();

  return (
    <Defs>
      <LinearGradient id={trend} x1="50%" x2="50%" y1="0%" y2="100%">
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
