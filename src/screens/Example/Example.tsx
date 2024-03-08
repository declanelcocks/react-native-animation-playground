import { ScrollView, Text, View } from 'react-native';

import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { useTheme } from '@/theme';

function Example() {
	const { gutters, fonts } = useTheme();

	return (
		<SafeScreen>
			<ScrollView>
				<View style={[gutters.margin_24]}>
					<Text
						style={[
							fonts.gray400,
							fonts.bold,
							fonts.size_16,
							gutters.marginBottom_32,
						]}
					>
						Welcome!
					</Text>
				</View>
			</ScrollView>
		</SafeScreen>
	);
}

export default Example;
