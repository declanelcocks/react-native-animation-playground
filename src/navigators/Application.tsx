import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useTheme } from '@/theme';

import Home from '@/screens/Home/Home';
import Telegram from '@/screens/Telegram/Telegram';
import type { ApplicationStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<ApplicationStackParamList>();

function ApplicationNavigator() {
	const { navigationTheme, fonts } = useTheme();

	return (
		<NavigationContainer theme={navigationTheme}>
			<Stack.Navigator
				screenOptions={{
					headerTitleStyle: {
						...fonts.gray400,
						fontWeight: fonts.bold.fontWeight,
					},
				}}
			>
				<Stack.Screen name="Home" component={Home} />
				<Stack.Screen
					name="Telegram"
					component={Telegram}
					options={{ headerShown: false }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default ApplicationNavigator;
