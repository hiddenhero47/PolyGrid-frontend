// Light theme. Every key here must be registered in THEME_SCHEMA
// (./schema.js) — adding a token means adding it there first.
//
// Base colors: the four from docs/assets/inspiration/light-theme-palette.png
// (#F7F7F7 background, #EEEEEE surface, #393E46 ink, #929AAB muted) —
// frontend-plan §5.2. Accent: the shared coral from §5.2.
const light = {
	surface: {
		background: '#F7F7F7', // page
		card: '#FFFFFF', // card / panel sitting on the page
		elevated: '#FFFFFF', // menus, popovers, modals
		sunken: '#EEEEEE', // inset wells, table headers, alt rows
		inverse: '#393E46', // tooltips, snackbars
		overlay: 'rgba(57, 62, 70, 0.45)', // modal scrim
	},

	text: {
		primary: '#393E46',
		secondary: '#5E6573', // #929AAB is too light for text on #F7F7F7
		placeholder: '#929AAB',
		disabled: '#C9CDD5',
		inverse: '#F7F7F7', // text on surface.inverse
		onAccent: '#FFFFFF', // label on an accent-filled button
		link: '#C2381F', // #FF5B3D is too light for body-size text here
	},

	border: {
		default: '#EEEEEE',
		strong: '#C9CDD5',
		muted: '#929AAB',
		// frontend-plan §3 Active state. #FF5B3D is only 2.9:1 on the
		// light background — below WCAG's 3:1 for a focus indicator.
		focus: '#E8482C',
		error: '#E11D48',
	},

	accent: {
		default: '#FF5B3D', // primary actions, focus, active nav
		emphasis: '#E8482C', // hover / pressed on accent
		subtle: '#FF8C70',
		soft: '#FFF1EE', // tinted background behind accent content
	},

	// Kept visibly apart from the coral accent (frontend-plan §3: error
	// must never read as the brand color).
	status: {
		success: '#047857',
		successSoft: 'rgba(16, 185, 129, 0.12)',
		warning: '#B45309',
		warningSoft: 'rgba(245, 158, 11, 0.14)',
		error: '#E11D48',
		errorSoft: 'rgba(225, 29, 72, 0.1)',
		info: '#1D4ED8',
		infoSoft: 'rgba(59, 130, 246, 0.12)',
		neutral: '#5E6573', // closed / withdrawn / cancelled-type states
		neutralSoft: 'rgba(146, 154, 171, 0.18)',
		special: '#6D28D9', // disputed
		specialSoft: 'rgba(139, 92, 246, 0.12)',
	},

	// Interaction overlays — laid over any base color, so a new component
	// gets hover/pressed for free (frontend-plan §5.3).
	state: {
		hover: 'rgba(57, 62, 70, 0.05)',
		pressed: 'rgba(57, 62, 70, 0.1)',
		selected: 'rgba(255, 91, 61, 0.1)',
		disabledOpacity: '0.45',
	},

	skeleton: {
		base: 'rgba(146, 154, 171, 0.12)',
		highlight: 'rgba(146, 154, 171, 0.22)',
	},
};

export default light;
