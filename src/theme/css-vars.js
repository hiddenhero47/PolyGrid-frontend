import { THEMES, DEFAULT_THEME } from './themes';

// Every token becomes a CSS custom property: surface.card →
// --pg-surface-card. The `pg-` prefix keeps them clear of Tailwind's own
// variables (--text-*, --color-*) and any library's.
//
// Both styling systems read the same variables, so they can't drift:
//   Tailwind:          className="bg-(--pg-surface-card) text-(--pg-text-secondary)"
//                      (opacity modifiers work too: bg-(--pg-accent-default)/20)
//   styled-components: background: ${({ theme }) => theme.surface.card};
//                      (resolves to var(--pg-surface-card))

const PREFIX = 'pg';

const toVarName = (path) => `--${PREFIX}-${path.join('-')}`;

const flatten = (obj, path = []) =>
	Object.entries(obj).flatMap(([key, value]) =>
		typeof value === 'object'
			? flatten(value, [...path, key])
			: [[toVarName([...path, key]), value]]
	);

// Same shape as the tokens, but every leaf is `var(--pg-…)` instead of a
// hex value. This is what styled-components' ThemeProvider receives, so a
// theme switch only swaps CSS variables — no component re-renders.
const toVarRefs = (obj, path = []) =>
	Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [
			key,
			typeof value === 'object'
				? toVarRefs(value, [...path, key])
				: `var(${toVarName([...path, key])})`,
		])
	);

export const themeVars = toVarRefs(THEMES[DEFAULT_THEME].tokens);

const declarations = (tokens) =>
	flatten(tokens)
		.map(([name, value]) => `${name}: ${value};`)
		.join('\n');

// One block per registered theme, keyed on <html data-theme="…">. The
// default theme also lands on bare :root so the page is styled even
// before data-theme is set.
export const themeCss = Object.entries(THEMES)
	.map(([name, { mode, tokens }]) => {
		const selector =
			name === DEFAULT_THEME
				? `:root, [data-theme='${name}']`
				: `[data-theme='${name}']`;
		return `${selector} {\ncolor-scheme: ${mode};\n${declarations(tokens)}\n}`;
	})
	.join('\n\n');
