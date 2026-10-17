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
};

export default dark;
