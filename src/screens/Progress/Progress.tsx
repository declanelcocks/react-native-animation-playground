import { ScrollView } from 'react-native';

import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { Rings } from './_components/Rings';

function Progress() {
	return (
		<SafeScreen>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<Rings />
			</ScrollView>
		</SafeScreen>
	);
}

export default Progress;
