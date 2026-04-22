import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import Chart from '@/screens/Chart/Chart';
import Home from '@/screens/Home';
import { Progress } from '@/screens/Progress';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant}>
          <Stack.Screen component={Home} name={Paths.Home} />
          <Stack.Screen component={Progress} name={Paths.Progress} />
          <Stack.Screen component={Chart} name={Paths.Chart} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
