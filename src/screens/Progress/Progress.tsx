import { ScrollView } from 'react-native';

import { Rings } from './components/Rings';

export function Progress() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Rings />
    </ScrollView>
  );
}

export default Progress;
