import { Link } from '@react-navigation/native';
import { ScrollView, Text, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

function Example() {
  const { fonts, gutters } = useTheme();

  return (
    <ScrollView>
      <View style={[gutters.margin_16]}>
        <Text
          style={[
            fonts.gray400,
            fonts.bold,
            fonts.size_16,
            gutters.marginBottom_16,
          ]}
        >
          Welcome!
        </Text>

        <Link screen={Paths.Progress} style={[fonts.gray400]}>
          Progress
        </Link>

        <Link screen={Paths.Chart} style={[fonts.gray400]}>
          Chart
        </Link>
      </View>
    </ScrollView>
  );
}

export default Example;
