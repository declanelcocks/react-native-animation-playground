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
	const { gutters, fonts, borders, changeTheme, variant } = useTheme();
	const navigation = useNavigation<NavigationProp<ApplicationStackParamList>>();

	const toggleTheme = () => {
		changeTheme(variant === 'default' ? 'dark' : 'default');
	};

	return (
		<DrawerContentScrollView {...props}>
			<View style={[gutters.margin_8]}>
				<TouchableOpacity
					onPress={toggleTheme}
					style={[
						gutters.padding_16,
						borders.w_2,
						borders.rounded_8,
						borders.gray400,
					]}
				>
					<Text style={{ color: fonts.gray400.color }}>Change theme</Text>
				</TouchableOpacity>
			</View>

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
