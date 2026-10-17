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
};
