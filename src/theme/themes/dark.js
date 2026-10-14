import { palette, alpha } from '../palette';

const { night, coral, crimson, emerald, amber, azure, violet } = palette;

// Same shape as themes/light.js — every key there must exist here.
const dark = {
	surface: {
		background: night[950],
		card: night[900],
		elevated: night[850],
		sunken: night[950],
		inverse: night[50],
		overlay: alpha(palette.black, 0.6),
	},

	text: {
		primary: night[50],
		secondary: night[400],
		placeholder: night[500],
		disabled: night[700],
		inverse: night[950],
		onAccent: palette.white,
		link: coral[300],
	},

	border: {
		default: night[800],
		strong: night[700],
		muted: night[500],
		focus: coral[500],
		error: crimson[300],
	},

	accent: {
		default: coral[500],
		emphasis: coral[600],
		subtle: coral[300],
		soft: alpha(coral[500], 0.12),
	},

	status: {
		success: emerald[300],
		successSoft: alpha(emerald[500], 0.16),
		warning: amber[300],
		warningSoft: alpha(amber[500], 0.16),
		error: crimson[300],
		errorSoft: alpha(crimson[500], 0.18),
		info: azure[300],
		infoSoft: alpha(azure[500], 0.18),
		neutral: night[400],
		neutralSoft: alpha(night[400], 0.16),
		special: violet[300],
		specialSoft: alpha(violet[500], 0.18),
	},

	state: {
		hover: alpha(night[50], 0.06),
		pressed: alpha(night[50], 0.12),
		selected: alpha(coral[500], 0.16),
		disabledOpacity: '0.4',
	},

	skeleton: {
		base: alpha(night[50], 0.04),
		highlight: alpha(night[50], 0.08),
	},
};

export default dark;
