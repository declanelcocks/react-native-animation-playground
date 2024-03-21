import {
	createContext,
	PropsWithChildren,
	RefObject,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';

import { config } from '@/theme/_config';
import { generateBackgrounds } from '@/theme/backgrounds';
import {
	generateBorderColors,
	generateBorderRadius,
	generateBorderWidths,
} from '@/theme/borders';
import componentsGenerator from '@/theme/components';
import {
	generateFontColors,
	generateFontSizes,
	staticFontStyles,
} from '@/theme/fonts';
import { generateGutters } from '@/theme/gutters';
import layout from '@/theme/layout';
import generateConfig from '@/theme/ThemeProvider/generateConfig';

import type {
	FulfilledThemeConfiguration,
	Variant,
} from '@/types/theme/config';
import type { ComponentTheme, Theme } from '@/types/theme/theme';
import {
	Canvas,
	Circle,
	dist,
	Image,
	ImageShader,
	makeImageFromView,
	mix,
	SkImage,
	vec,
} from '@shopify/react-native-skia';
import { Dimensions, StyleSheet, View } from 'react-native';
import type { MMKV } from 'react-native-mmkv';
import {
	SharedValue,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

// Types

type Context = Theme & {
	changeTheme: (variant: Variant) => void;
	toggleTheme: (x: number, y: number) => void;
};

export interface ToggleThemeState {
	ref?: RefObject<View>;
	transition?: SharedValue<number>;
	circle?: SharedValue<{ x: number; y: number; r: number }>;
	active?: boolean;
	overlay1?: SkImage | null;
	overlay2?: SkImage | null;
}

const wait = async (ms: number) =>
	// eslint-disable-next-line no-promise-executor-return
	new Promise(resolve => setTimeout(resolve, ms));

const { width, height } = Dimensions.get('screen');
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

export const ThemeContext = createContext<Context | undefined>(undefined);

type Props = PropsWithChildren<{
	storage: MMKV;
}>;

function ThemeProvider({ children, storage }: Props) {
	// toggleState props
	const circle = useSharedValue({ x: 0, y: 0, r: 0 });
	const transition = useSharedValue(0);
	const ref = useRef(null);

	// Current theme variant
	const [variant, setVariant] = useState(
		(storage.getString('theme') as Variant) || 'default',
	);

	// Initialize theme at default if not defined
	useEffect(() => {
		const appHasThemeDefined = storage.contains('theme');
		if (!appHasThemeDefined) {
			storage.set('theme', 'default');
			setVariant('default');
		}
	}, []);

	const changeTheme = (nextVariant: Variant) => {
		setVariant(nextVariant);
		storage.set('theme', nextVariant);
	};

	// Flatten config with current variant
	const fullConfig = useMemo(() => {
		return generateConfig(variant) satisfies FulfilledThemeConfiguration;
	}, [variant, config]);

	const fonts = useMemo(() => {
		return {
			...generateFontSizes(),
			...generateFontColors(fullConfig),
			...staticFontStyles,
		};
	}, [fullConfig]);

	const backgrounds = useMemo(() => {
		return generateBackgrounds(fullConfig);
	}, [fullConfig]);

	const borders = useMemo(() => {
		return {
			...generateBorderColors(fullConfig),
			...generateBorderRadius(),
			...generateBorderWidths(),
		};
	}, [fullConfig]);

	const navigationTheme = useMemo(() => {
		return {
			dark: variant === 'dark',
			colors: fullConfig.navigationColors,
		};
	}, [variant, fullConfig.navigationColors]);

	const toggleStateReducer = (
		oldState: ToggleThemeState,
		newState: ToggleThemeState,
	) => {
		return {
			...oldState,
			...newState,
		};
	};

	const [toggleThemeState, dispatch] = useReducer(toggleStateReducer, {
		ref,
		circle,
		transition,
	});

	/**
	 * calls `await wait(16)` throughout the toggleTheme function to
	 * wait for the next render
	 */
	const toggleTheme = useCallback(
		async (x: number, y: number) => {
			dispatch({
				active: true,
				overlay1: null,
				overlay2: null,
			});

			// 1 - Define the circle to animate and its maximum radius, which is
			// based on the corners of the device's screen
			const r = Math.max(...corners.map(corner => dist(corner, { x, y })));
			circle.value = { x, y, r };

			// 2 - Take a snapshot of the current screen which will be shown as
			// an overlay over the app
			const overlay1 = await makeImageFromView(ref);
			dispatch({
				active: true,
				overlay1,
				overlay2: null,
			});

			// 3 - Switch to dark mode
			await wait(16);
			changeTheme(variant === 'default' ? 'dark' : 'default');
			dispatch({
				active: true,
				overlay1,
				overlay2: null,
			});

			// 4 - Wait for dark mode to render
			await wait(16);

			// 5 - Take snapshot of the dark mode view and set this
			// as the second overlay underneath
			const overlay2 = await makeImageFromView(ref);
			dispatch({
				active: true,
				overlay1,
				overlay2,
			});

			// 6 - Update the transition value from 0 to 1 over 500ms. This
			// transition value will be used to animate the transition between
			// overlay1 and overlay2 on the page.
			transition.value = 0;
			transition.value = withTiming(1, { duration: 500 });
			await wait(500);
			dispatch({
				active: false,
				overlay1: null,
				overlay2: null,
			});
		},
		[variant],
	);

	const theme = useMemo(() => {
		return {
			colors: fullConfig.colors,
			variant,
			gutters: generateGutters(),
			layout,
			fonts,
			backgrounds,
			borders,
			toggleThemeState,
		} satisfies ComponentTheme;
	}, [
		variant,
		layout,
		fonts,
		backgrounds,
		borders,
		fullConfig.colors,
		toggleThemeState.active,
	]);

	const components = useMemo(() => {
		return componentsGenerator(theme);
	}, [theme]);

	const value = useMemo(() => {
		return { ...theme, components, navigationTheme, changeTheme, toggleTheme };
	}, [theme, components, navigationTheme, changeTheme]);

	// Animated circle radius value based on the transition value
	// As the transition value goes from 0 to 1, the radius will get bigger
	// and bigger. Since `circle.value.r` is the max radius where it will cover
	// the whole screen, then this `mix()` will animate it from 0 to that
	// value based on `transition.value`.
	const r = useDerivedValue(() => {
		return mix(transition.value, 0, circle.value.r);
	});

	return (
		<View style={{ flex: 1 }}>
			<View ref={ref} style={{ flex: 1 }} collapsable={false}>
				<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
			</View>

			<Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
				<Image
					image={toggleThemeState.overlay1 as SkImage}
					x={0}
					y={0}
					width={width}
					height={height}
				/>

				{toggleThemeState.overlay2 && (
					<Circle c={circle} r={r}>
						<ImageShader
							image={toggleThemeState.overlay2}
							x={0}
							y={0}
							width={width}
							height={height}
							fit="cover"
						/>
					</Circle>
				)}
			</Canvas>
		</View>
	);
}

export default ThemeProvider;
