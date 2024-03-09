import type { StackScreenProps } from '@react-navigation/stack';

export type ApplicationStackParamList = {
	Home: undefined;
	Telegram: undefined;
};

export type ApplicationScreenProps =
	StackScreenProps<ApplicationStackParamList>;
