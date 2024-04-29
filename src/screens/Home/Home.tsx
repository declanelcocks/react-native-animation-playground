import { ScrollView, Text, View } from 'react-native';

import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { useTheme } from '@/theme';
import { Link } from '@react-navigation/native';

function Home() {
	const { gutters, fonts } = useTheme();

	return (
		<SafeScreen>
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

					<Link to="/Telegram" style={[fonts.gray400]}>
						Telegram
					</Link>

					<Link to="/Progress" style={[fonts.gray400]}>
						Progress
					</Link>

					<Link to="/SdfCircle" style={[fonts.gray400]}>
						Signed Distance Function: Circle
					</Link>

					<Link to="/SdfLine" style={[fonts.gray400]}>
						Signed Distance Function: Line
					</Link>
				</View>
			</ScrollView>
		</SafeScreen>
	);
}

export default Home;
