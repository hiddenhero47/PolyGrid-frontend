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
		highlight: '#456882', // slate — the light design's accent, not coral
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
	// ── By design purpose ──
	logo: {
		base: '#393E46',
		accent: '#FF5B3D',
	},

	// White label, per the design. Note: white on #FF5B3D is 3.1:1 —
	// enough for large/bold text only (WCAG AA wants 4.5:1 for small text).
	button: {
		primaryBg: '#FF5B3D',
		primaryHover: '#E8482C',
		primaryText: '#FFFFFF',
		secondaryBg: '#EEEEEE',
		secondaryHover: '#E2E3E7',
		secondaryText: '#1A1C20',
		secondaryBorder: '#E0E0E0',
	},

	// Light theme: supporting accents are slate (#456882 — chips, icon
	// tiles, pillar labels, tabs). Coral is kept for brand moments and
	// actions: buttons, arrow links, section eyebrows, the hero's accent
	// word, number badges, and accent-tone icons.
	chip: {
		background: '#EEEEEE',
		text: '#393E46',
		border: '#E2E3E7',
		accentBg: '#EDF2F7',
		accentText: '#456882',
		accentBorder: '#CBD5E1',
	},

	// default tone slate; accent tone coral — for the few icons that mark
	// a key promise (escrow) or a person (avatar initials)
	icon: {
		background: '#EDF2F7',
		border: '#CBD5E1',
		color: '#456882',
		accentBackground: '#FFF1EE',
		accentBorder: '#FFD3C9',
		accentColor: '#E8482C',
		successBackground: '#ECFDF5',
		successBorder: '#A7F3D0',
		successColor: '#059669',
	},

	form: {
		background: '#F3F4F6',
		border: '#E2E3E7',
		borderHover: '#C9CDD5',
		focus: '#E8482C',
		text: '#1A1C20',
		placeholder: '#929AAB',
		label: '#393E46',
		hint: '#5E6573',
		error: '#E11D48',
		disabledBg: '#EEEEEE',
		disabledText: '#A3AAB8',
		disabledBorder: '#E2E3E7',
		menuBg: '#FFFFFF',
		menuBorder: '#E2E3E7',
		optionHover: '#F3F4F6',
		optionSelectedBg: '#FFF1EE',
		optionSelectedText: '#C2381F',
		control: '#FF5B3D',
		controlBorder: '#C9CDD5',
		controlMark: '#FFFFFF',
		switchTrack: '#C9CDD5',
		switchThumb: '#FFFFFF',
	},

	badge: {
		background: '#FF5B3D',
		text: '#FFFFFF',
	},

	tab: {
		activeBg: '#464858',
		activeText: '#FFFFFF',
	},

	glass: {
		background: 'rgba(11, 13, 18, 0.62)',
		border: 'rgba(242, 242, 242, 0.1)',
		text: '#F2F2F2',
		sbText: 'rgba(242, 242, 242, 0.7)',
	},

	// ── By component / feature ──
	navbar: {
		background: 'rgba(247, 247, 247, 0.85)',
		border: '#E2E3E7',
		link: '#5E6573',
		linkHover: '#393E46',
		menuBg: '#FFFFFF',
	},

	card: {
		background: '#FFFFFF',
		border: '#E2E3E7',
		borderHover: '#C9CDD5',
		imageOverlay:
			'linear-gradient(180deg, rgba(20, 23, 31, 0) 35%, rgba(20, 23, 31, 0.7) 100%)',
	},

	footer: {
		background: '#FFFFFF',
		border: '#E2E3E7',
		heading: '#393E46',
		link: '#5E6573',
		linkHover: '#C2381F',
		text: '#5E6573',
	},

	intro: {
		background: '#F7F7F7',
		gridLine: 'rgba(57, 62, 70, 0.07)',
		glow: 'rgba(255, 91, 61, 0.3)',
		text: '#393E46',
		sbText: '#E8482C',
	},

	modal: {
		backdrop: 'rgba(26, 28, 32, 0.45)',
		background: '#FFFFFF',
		border: '#E2E3E7',
		divider: '#EEEEEE',
		handle: '#C9CDD5',
	},

	table: {
		headerBg: '#F3F4F6',
		headerText: '#5E6573',
		cellText: '#1A1C20',
		rowBorder: '#EEEEEE',
		rowHover: '#F7F7F7',
		stripe: '#FAFAFA',
	},

	// ── By area ──
	hero: {
		glow: 'rgba(255, 91, 61, 0.1)',
		imageOverlay:
			'linear-gradient(180deg, rgba(20, 23, 31, 0.2) 0%, rgba(20, 23, 31, 0.8) 100%)',
	},
};

export default light;
