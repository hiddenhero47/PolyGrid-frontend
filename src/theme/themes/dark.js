// Dark theme. Every key here must be registered in THEME_SCHEMA
// (./schema.js) — adding a token means adding it there first.
//
// Base colors: frontend-plan §5.2's eyeball estimates from the dark
// reference images (#0B0D12 background, #14171F surface, #F2F2F2 ink,
// #9CA3AF muted) — fine-tune with an eyedropper. #1C202B / #282D3B match
// the Stitch design system's surface-elevated / surface-border.
const dark = {
	surface: {
		background: '#0B0D12',
		card: '#14171F',
		elevated: '#1C202B',
		sunken: '#0B0D12',
		inverse: '#F2F2F2',
		overlay: 'rgba(0, 0, 0, 0.6)',
	},

	text: {
		primary: '#F2F2F2',
		secondary: '#9CA3AF',
		placeholder: '#6B7280',
		disabled: '#3A4052',
		inverse: '#0B0D12',
		onAccent: '#FFFFFF',
		link: '#FF8C70',
		highlight: '#FF5B3D',
	},

	border: {
		default: '#282D3B',
		strong: '#3A4052',
		muted: '#6B7280',
		focus: '#FF5B3D',
		error: '#FF7A90',
	},

	accent: {
		default: '#FF5B3D',
		emphasis: '#E8482C',
		subtle: '#FF8C70',
		soft: 'rgba(255, 91, 61, 0.12)',
	},

	status: {
		success: '#34D399',
		successSoft: 'rgba(16, 185, 129, 0.16)',
		warning: '#FCD34D',
		warningSoft: 'rgba(245, 158, 11, 0.16)',
		error: '#FF7A90',
		errorSoft: 'rgba(225, 29, 72, 0.18)',
		info: '#7CB4FF',
		infoSoft: 'rgba(59, 130, 246, 0.18)',
		neutral: '#9CA3AF',
		neutralSoft: 'rgba(156, 163, 175, 0.16)',
		special: '#C4B5FD',
		specialSoft: 'rgba(139, 92, 246, 0.18)',
	},

	state: {
		hover: 'rgba(242, 242, 242, 0.06)',
		pressed: 'rgba(242, 242, 242, 0.12)',
		selected: 'rgba(255, 91, 61, 0.16)',
		disabledOpacity: '0.4',
	},

	skeleton: {
		base: 'rgba(242, 242, 242, 0.04)',
		highlight: 'rgba(242, 242, 242, 0.08)',
	},
	// ── By design purpose ──
	logo: {
		base: '#F2F2F2',
		accent: '#FF5B3D',
	},

	button: {
		primaryBg: '#FF5B3D',
		primaryHover: '#FF7A5C',
		primaryText: '#1A0A06',
		secondaryBg: '#1C202B',
		secondaryHover: '#282D3B',
		secondaryText: '#F2F2F2',
		secondaryBorder: '#282D3B',
	},

	chip: {
		background: '#1C202B',
		text: '#C9CDD5',
		border: '#282D3B',
		accentBg: 'rgba(255, 91, 61, 0.12)',
		accentText: '#FF8C70',
		accentBorder: 'transparent',
	},

	icon: {
		background: '#1C202B',
		border: 'transparent',
		color: '#FF5B3D',
		accentBackground: 'rgba(255, 91, 61, 0.2)',
		accentBorder: 'transparent',
		accentColor: '#FF5B3D',
		successBackground: 'rgba(16, 185, 129, 0.2)',
		successBorder: 'transparent',
		successColor: '#10B981',
	},

	// Fields sit darker than the cards they're on (Stitch Browse
	// Consultants), with a coral ring when active.
	form: {
		background: '#0E1117',
		border: '#282D3B',
		borderHover: '#3A4052',
		focus: '#FF5B3D',
		text: '#F2F2F2',
		placeholder: '#6B7280',
		label: '#C9CDD5',
		hint: '#9CA3AF',
		error: '#FF7A90',
		disabledBg: '#14171F',
		disabledText: '#4B5263',
		disabledBorder: '#1C202B',
		menuBg: '#1C202B',
		menuBorder: '#282D3B',
		optionHover: 'rgba(242, 242, 242, 0.06)',
		optionSelectedBg: 'rgba(255, 91, 61, 0.14)',
		optionSelectedText: '#FF8C70',
		control: '#FF5B3D',
		controlBorder: '#3A4052',
		controlMark: '#1A0A06',
		switchTrack: '#282D3B',
		switchThumb: '#F2F2F2',
	},

	badge: {
		background: '#FF5B3D',
		text: '#1A0A06',
	},

	tab: {
		activeBg: '#FF5B3D',
		activeText: '#1A0A06',
	},

	glass: {
		background: 'rgba(11, 13, 18, 0.62)',
		border: 'rgba(242, 242, 242, 0.1)',
		text: '#F2F2F2',
		sbText: 'rgba(242, 242, 242, 0.7)',
	},

	// ── By component / feature ──
	navbar: {
		background: 'rgba(11, 13, 18, 0.85)',
		border: '#1C202B',
		link: '#9CA3AF',
		linkHover: '#F2F2F2',
		menuBg: '#14171F',
	},

	card: {
		background: '#14171F',
		border: '#1C202B',
		borderHover: '#3A4052',
		imageOverlay:
			'linear-gradient(180deg, rgba(11, 13, 18, 0) 30%, rgba(11, 13, 18, 0.85) 100%)',
	},

	footer: {
		background: '#080A0E',
		border: '#1C202B',
		heading: '#F2F2F2',
		link: '#9CA3AF',
		linkHover: '#FF8C70',
		text: '#6B7280',
	},

	intro: {
		background: '#0B0D12',
		gridLine: 'rgba(242, 242, 242, 0.05)',
		glow: 'rgba(255, 91, 61, 0.45)',
		text: '#F2F2F2',
		sbText: '#FF5B3D',
	},

	modal: {
		backdrop: 'rgba(5, 6, 9, 0.72)',
		background: '#14171F',
		border: '#282D3B',
		divider: '#1C202B',
		handle: '#3A4052', // bottom-sheet grab bar
	},

	table: {
		headerBg: '#1C202B',
		headerText: '#9CA3AF',
		cellText: '#F2F2F2',
		rowBorder: '#1C202B',
		rowHover: 'rgba(242, 242, 242, 0.04)',
		stripe: 'rgba(242, 242, 242, 0.02)',
	},

	// ── By area ──
	hero: {
		glow: 'rgba(255, 91, 61, 0.14)',
		imageOverlay:
			'linear-gradient(180deg, rgba(11, 13, 18, 0.25) 0%, rgba(11, 13, 18, 0.85) 100%)',
	},
};

export default dark;
