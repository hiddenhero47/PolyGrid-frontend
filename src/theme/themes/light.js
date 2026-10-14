import { palette, alpha } from '../palette';

const { mist, coral, crimson, emerald, amber, azure, violet } = palette;

// Light is the *reference* theme: its shape (group + token names) is the
// contract every other theme must match — see themes/index.js.
//
// Groups are by role, not by color family (frontend-plan §5.3). Add a
// token here first, then give it a value in every other theme.
const light = {
	surface: {
		background: mist[50], // page
		card: mist[0], // card / panel sitting on the page
		elevated: mist[0], // menus, popovers, modals
		sunken: mist[100], // inset wells, table headers, alt rows
		inverse: mist[900], // tooltips, snackbars
		overlay: alpha(mist[900], 0.45), // modal scrim
	},

	text: {
		primary: mist[900],
		secondary: mist[600],
		placeholder: mist[400],
		disabled: mist[300],
		inverse: mist[50], // text on surface.inverse
		onAccent: palette.white, // label on an accent-filled button
		link: coral[700], // coral[500] is too light for body-size text here
	},

	border: {
		default: mist[100],
		strong: mist[300],
		muted: mist[400],
		// frontend-plan §3 Active state. coral[500] is only 2.9:1 on the
		// light background — below WCAG's 3:1 for a focus indicator.
		focus: coral[600],
		error: crimson[500],
	},

	accent: {
		default: coral[500], // primary actions, focus, active nav
		emphasis: coral[600], // hover / pressed on accent
		subtle: coral[300],
		soft: coral[50], // tinted background behind accent content
	},

	status: {
		success: emerald[700],
		successSoft: alpha(emerald[500], 0.12),
		warning: amber[700],
		warningSoft: alpha(amber[500], 0.14),
		error: crimson[500],
		errorSoft: alpha(crimson[500], 0.1),
		info: azure[700],
		infoSoft: alpha(azure[500], 0.12),
		neutral: mist[600], // closed / withdrawn / cancelled-type states
		neutralSoft: alpha(mist[400], 0.18),
		special: violet[700], // disputed
		specialSoft: alpha(violet[500], 0.12),
	},

	// Interaction overlays — laid over any base color, so a new component
	// gets hover/pressed for free (frontend-plan §5.3).
	state: {
		hover: alpha(mist[900], 0.05),
		pressed: alpha(mist[900], 0.1),
		selected: alpha(coral[500], 0.1),
		disabledOpacity: '0.45',
	},

	skeleton: {
		base: alpha(mist[400], 0.12),
		highlight: alpha(mist[400], 0.22),
	},
};

export default light;
