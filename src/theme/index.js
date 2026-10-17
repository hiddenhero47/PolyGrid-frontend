import light from './themes/light';
import dark from './themes/dark';
import { THEME_SCHEMA } from './themes/schema';
import { validateTheme } from './themes/validation';

// The list of allowed groups/tokens lives in themes/schema.js.
export { THEME_SCHEMA };

const isPlainObject = (value) =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

// ─── Building themes ───────────────────────────────────────────────────
// Make a theme from an existing one, stating only what changes:
//   const christmas = extendTheme(dark, { accent: { default: '#C41E3A' } });
// Groups merge token by token; a single color is simply replaced. A
// typo'd name isn't silently dropped — it's kept, so the schema check
// flags it.
export const extendTheme = (base, overrides = {}) =>
	Object.fromEntries(
		[...new Set([...Object.keys(base), ...Object.keys(overrides)])].map(
			(key) => {
				const from = base[key];
				const to = overrides[key];
				return [
					key,
					isPlainObject(from) && isPlainObject(to)
						? { ...from, ...to }
						: (to ?? from),
				];
			}
		)
	);

// ─── Registry ──────────────────────────────────────────────────────────
// To add a theme: create its file (or extendTheme one), add a line here.
//   mode  — 'light' | 'dark': which base it is, for browser chrome
//           (color-scheme), toasts, and toggleTheme's light/dark flip.
//   label — shown in a theme picker.
export const THEMES = {
	light: { label: 'Light', mode: 'light', tokens: light },
	dark: { label: 'Dark', mode: 'dark', tokens: dark },
};

export const DEFAULT_THEME = 'light';

export const isThemeName = (name) => Object.hasOwn(THEMES, name);

// Development only: throws if any theme breaks THEME_SCHEMA
// (see themes/validation.js).
if (import.meta.env.DEV) {
	Object.entries(THEMES).forEach(([name, { tokens }]) =>
		validateTheme(name, tokens)
	);
}

// ─── CSS variables ─────────────────────────────────────────────────────
// Every token becomes a CSS custom property: surface.card →
// --pg-surface-card, a single color like brand → --pg-brand. The `pg-` prefix keeps them clear of Tailwind's own
// variables (--text-*, --color-*) and any library's.
//
// Both styling systems read the same variables, so they can't drift:
//   Tailwind:          className="bg-(--pg-surface-card) text-(--pg-text-secondary)"
//   styled-components: background: ${({ theme }) => theme.surface.card};
const toVarName = (...path) => `--pg-${path.join('-')}`;

// Same shape as THEME_SCHEMA, but every token is `var(--pg-…)`. This is
// what styled-components' ThemeProvider receives, so a theme switch only
// swaps CSS variable values — no component re-renders.
export const themeVars = Object.fromEntries(
	Object.entries(THEME_SCHEMA).map(([key, names]) => [
		key,
		Array.isArray(names)
			? Object.fromEntries(
					names.map((name) => [name, `var(${toVarName(key, name)})`])
				)
			: `var(${toVarName(key)})`,
	])
);

const declarations = (tokens) =>
	Object.entries(tokens)
		.flatMap(([key, value]) =>
			isPlainObject(value)
				? Object.entries(value).map(
						([name, color]) => `${toVarName(key, name)}: ${color};`
					)
				: [`${toVarName(key)}: ${value};`]
		)
		.join('\n');

// One block per registered theme, keyed on <html data-theme="…">. The
// default theme also lands on bare :root so the page is styled even
// before data-theme is set. Injected by src/global.style.js.
export const themeCss = Object.entries(THEMES)
	.map(([name, { mode, tokens }]) => {
		const selector =
			name === DEFAULT_THEME
				? `:root, [data-theme='${name}']`
				: `[data-theme='${name}']`;
		return `${selector} {\ncolor-scheme: ${mode};\n${declarations(tokens)}\n}`;
	})
	.join('\n\n');

// Raw hex values, for the rare consumer that can't read a CSS variable
// (chart.js canvas, Stripe Elements `appearance`): THEMES[name].tokens.
