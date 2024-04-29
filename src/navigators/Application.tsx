import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useTheme } from '@/theme';

import Home from '@/screens/Home/Home';
import Progress from '@/screens/Progress/Progress';
import { SdfCircle } from '@/screens/SdfCircle/SdfCircle';
import { SdfLine } from '@/screens/SdfLine/SdfLine';
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

				<Stack.Screen name="Progress" component={Progress} />

				<Stack.Screen name="SdfCircle" component={SdfCircle} />

				<Stack.Screen name="SdfLine" component={SdfLine} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default ApplicationNavigator;
