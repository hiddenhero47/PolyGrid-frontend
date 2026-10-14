import light from './light';
import dark from './dark';

// Deep-merge overrides onto a base theme. Lets a seasonal theme only
// state what it changes:
//   const christmas = extendTheme(dark, { accent: { default: '#C41E3A' } });
export const extendTheme = (base, overrides = {}) =>
	Object.fromEntries(
		Object.entries(base).map(([key, value]) => [
			key,
			typeof value === 'object'
				? extendTheme(value, overrides[key])
				: (overrides[key] ?? value),
		])
	);

// The theme registry. To add a theme: create its file (or extendTheme
// one), then register it here — nothing else in the app changes.
//   mode  — 'light' | 'dark': which base it is, for browser chrome
//           (color-scheme), toasts, and toggleTheme's light/dark flip.
//   label — shown in a theme picker.
export const THEMES = {
	light: { label: 'Light', mode: 'light', tokens: light },
	dark: { label: 'Dark', mode: 'dark', tokens: dark },
};

export const DEFAULT_THEME = 'light';
export const THEME_STORAGE_KEY = 'pg-theme';

export const isThemeName = (name) => Object.hasOwn(THEMES, name);

// Every theme must define exactly the token names the reference (light)
// theme does. A missing token would silently render as an unset CSS
// variable, so catch it loudly in development instead.
const tokenPaths = (obj, prefix = '') =>
	Object.entries(obj).flatMap(([key, value]) =>
		typeof value === 'object'
			? tokenPaths(value, `${prefix}${key}.`)
			: [`${prefix}${key}`]
	);

if (import.meta.env.DEV) {
	const reference = tokenPaths(light);
	Object.entries(THEMES).forEach(([name, { tokens }]) => {
		const paths = tokenPaths(tokens);
		const missing = reference.filter((path) => !paths.includes(path));
		const extra = paths.filter((path) => !reference.includes(path));
		if (missing.length || extra.length) {
			console.error(
				`[theme] "${name}" doesn't match the light theme's token shape.`,
				{ missing, extra }
			);
		}
	});
}
