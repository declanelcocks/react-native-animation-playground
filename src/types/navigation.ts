import type { StackScreenProps } from '@react-navigation/stack';

export type ApplicationStackParamList = {
	Home: undefined;
	Telegram: undefined;
	Progress: undefined;
	SdfCircle: undefined;
	SdfLine: undefined;
};

export type ApplicationScreenProps =
	StackScreenProps<ApplicationStackParamList>;
