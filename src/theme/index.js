export {
	THEMES,
	DEFAULT_THEME,
	THEME_STORAGE_KEY,
	isThemeName,
	extendTheme,
} from './themes';
export { themeVars, themeCss } from './css-vars';

// Components use themeVars (CSS-variable refs). THEMES[name].tokens holds
// the raw hex values, only for the rare consumer that can't read a CSS
// variable — a chart.js canvas, a Stripe Elements `appearance` object.
