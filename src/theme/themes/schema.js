// Every token a theme is allowed to have — names only, no colors. This is
// the one list to read to know what's available, and the rule every
// theme is checked against: same names, nothing extra, nothing missing,
// never nested deeper than group → token.
//
// Two kinds of entry:
//   group: ['a', 'b']  → theme has  group: { a: '#…', b: '#…' }
//                        CSS vars   --pg-group-a, --pg-group-b
//   oneColor: ''       → theme has  oneColor: '#…'   (not nested)
//                        CSS var    --pg-oneColor
// An array is a group; anything else is a single color (the value itself
// is ignored — '' is just a placeholder).
//
// Adding a token: register it here, then give it a value in every theme
// (themes/light.js, themes/dark.js, …).
export const THEME_SCHEMA = {
	surface: ['background', 'card', 'elevated', 'sunken', 'inverse', 'overlay'],
	text: [
		'primary',
		'secondary',
		'placeholder',
		'disabled',
		'inverse',
		'onAccent',
		'link',
		'highlight', // accent word in headings, pillar eyebrows
	],
	border: ['default', 'strong', 'muted', 'focus', 'error'],
	accent: ['default', 'emphasis', 'subtle', 'soft'],
	status: [
		'success',
		'successSoft',
		'warning',
		'warningSoft',
		'error',
		'errorSoft',
		'info',
		'infoSoft',
		'neutral',
		'neutralSoft',
		'special',
		'specialSoft',
	],
	state: ['hover', 'pressed', 'selected', 'disabledOpacity'],
	skeleton: ['base', 'highlight'],

	// ── By design purpose ──
	logo: ['base', 'accent'],
	button: [
		'primaryBg',
		'primaryHover',
		'primaryText',
		'secondaryBg',
		'secondaryHover',
		'secondaryText',
		'secondaryBorder',
	],
	chip: [
		'background',
		'text',
		'border',
		'accentBg',
		'accentText',
		'accentBorder',
	],
	// icon tiles: default, accent and success tones
	icon: [
		'background',
		'border',
		'color',
		'accentBackground',
		'accentBorder',
		'accentColor',
		'successBackground',
		'successBorder',
		'successColor',
	],
	// every form control (frontend-plan §3 states: normal, filled, active,
	// error, disabled)
	form: [
		'background', // filled variant
		'border',
		'borderHover',
		'focus', // Active state ring/border
		'text',
		'placeholder',
		'label',
		'hint',
		'error',
		'disabledBg',
		'disabledText',
		'disabledBorder',
		'menuBg', // select dropdowns
		'menuBorder',
		'optionHover',
		'optionSelectedBg',
		'optionSelectedText',
		'control', // checked checkbox / radio / switch
		'controlBorder',
		'controlMark', // the tick on a checked checkbox
		'switchTrack',
		'switchThumb',
	],
	// numbered / counter badges
	badge: ['background', 'text'],
	tab: ['activeBg', 'activeText'],
	// frosted labels laid over photos — light text in every theme, since
	// they always sit on a photo's dark overlay
	glass: ['background', 'border', 'text', 'sbText'],

	// ── By component / feature ──
	navbar: ['background', 'border', 'link', 'linkHover', 'menuBg'],
	card: ['background', 'border', 'borderHover', 'imageOverlay'],
	footer: ['background', 'border', 'heading', 'link', 'linkHover', 'text'],
	intro: ['background', 'gridLine', 'glow', 'text', 'sbText'],
	modal: ['backdrop', 'background', 'border', 'divider', 'handle'],
	table: [
		'headerBg',
		'headerText',
		'cellText',
		'rowBorder',
		'rowHover',
		'stripe',
	],

	// ── By area ──
	hero: ['glow', 'imageOverlay'],
};
