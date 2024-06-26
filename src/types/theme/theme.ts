import componentGenerators from '@/theme/components';
import layout from '@/theme/layout';

import { ToggleThemeState } from '@/theme/ThemeProvider/ThemeProvider';
import type { Colors } from '@/types/theme/colors';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import type { Backgrounds } from './backgrounds';
import type { Borders } from './borders';
import type { Variant } from './config';
import type { Fonts } from './fonts';
import type { Gutters } from './gutters';

export type Theme = {
	colors: Colors;
	variant: Variant;
	layout: typeof layout;
	gutters: Gutters;
	fonts: Fonts;
	backgrounds: Backgrounds;
	borders: Borders;
	navigationTheme: NavigationTheme;
	components: ReturnType<typeof componentGenerators>;
	toggleThemeState: ToggleThemeState;
};

export type ComponentTheme = Omit<Theme, 'components' | 'navigationTheme'>;
