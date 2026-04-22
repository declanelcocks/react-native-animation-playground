import dayjs from 'dayjs';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { Quote } from '../types';
import { formatPrice } from '../utils';

interface Props {
  overflow?: boolean;
  quote?: Quote;
}

/**
 * Display the Core Trading session close price when Extended Trading Hours market are opened
 */
export function CoreQuoteSection({ overflow, quote }: Props) {
  const theme = useTheme();

  if (!quote) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.purple100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        ...(overflow && { marginHorizontal: -8 }),
      }}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text style={{ fontSize: 10 }}>core close</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold', paddingRight: 1 }}>
          {formatPrice(quote.last, quote.currencySymbol)}
        </Text>

        <Text style={{ fontSize: 10 }}>
          {Number(quote.change)} {Number(quote.changeRatio)}
        </Text>
      </View>
      <Text style={{ fontSize: 10 }}>
        {dayjs(quote.timestamp).format('DD-MM-YYYY HH:mm')}
      </Text>
    </View>
  );
}
export default CoreQuoteSection;
