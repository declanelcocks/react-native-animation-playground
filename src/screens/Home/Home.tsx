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

					<Link to="/Telegram">Telegram</Link>
				</View>
			</ScrollView>
		</SafeScreen>
	);
}

export default Home;
