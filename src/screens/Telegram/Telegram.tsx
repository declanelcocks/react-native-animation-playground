import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { useTheme } from '@/theme';
import { ApplicationStackParamList } from '@/types/navigation';
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItemList,
	createDrawerNavigator,
} from '@react-navigation/drawer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function Telegram() {
	const { gutters, fonts } = useTheme();

	return (
		<SafeScreen>
			<ScrollView>
				<View style={[gutters.margin_16]}>
					<Text style={[fonts.gray400, fonts.bold, fonts.size_16]}>
						Telegram!
					</Text>
				</View>
			</ScrollView>
		</SafeScreen>
	);
}

const Drawer = createDrawerNavigator();

function CustomDrawerContent(
	props: PropsWithChildren<DrawerContentComponentProps>,
) {
	const { gutters, fonts, borders, toggleTheme, toggleThemeState } = useTheme();
	const navigation = useNavigation<NavigationProp<ApplicationStackParamList>>();

	const tap = Gesture.Tap()
		.runOnJS(true)
		.onStart(e => {
			if (!toggleThemeState.active) {
				toggleTheme(e.absoluteX, e.absoluteY);
			}
		});

	return (
		<DrawerContentScrollView {...props}>
			<GestureDetector gesture={tap}>
				<View
					style={[
						gutters.margin_8,
						gutters.padding_16,
						borders.w_2,
						borders.rounded_8,
						borders.gray400,
					]}
				>
					<Text style={{ color: fonts.gray400.color }}>Change theme</Text>
				</View>
			</GestureDetector>

			<View style={[gutters.margin_8]}>
				<TouchableOpacity
					onPress={() => navigation.navigate('Home')}
					style={[
						gutters.padding_16,
						borders.w_2,
						borders.rounded_8,
						borders.gray400,
					]}
				>
					<Text style={{ color: fonts.gray400.color }}>Home</Text>
				</TouchableOpacity>
			</View>

			<DrawerItemList {...props} />
		</DrawerContentScrollView>
	);
}

function TelegramDrawer() {
	const { fonts } = useTheme();

	return (
		<Drawer.Navigator
			screenOptions={{
				headerTintColor: fonts.gray400.color,
			}}
			drawerContent={CustomDrawerContent}
		>
			<Drawer.Screen name="TelegramScreen" component={Telegram} />
		</Drawer.Navigator>
	);
}

export default TelegramDrawer;
