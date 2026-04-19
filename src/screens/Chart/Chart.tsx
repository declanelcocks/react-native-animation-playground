import { ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';

function Example() {
  const { gutters } = useTheme();

  return (
    <ScrollView>
      <View style={[gutters.margin_16]}>
        <Text>Hello</Text>
      </View>
    </ScrollView>
  );
}

export default Example;
