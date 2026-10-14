// Raw color primitives — the only place a hex value should be typed.
//
// Nothing outside src/theme/ imports this file. Components never use a
// palette color directly; they use a *semantic token* (surface.card,
// text.secondary, accent.default, …) that a theme file maps onto one of
// these. That indirection is what lets a new theme be a palette swap.
//
// Sources: docs/frontend-plan.md §5.2 (light palette taken as-is from
// docs/assets/inspiration/light-theme-palette.png; dark + accent values
// are eyeball estimates from the dark-theme references — fine-tune here
// with an eyedropper, every theme picks up the change).

export const palette = {
	white: '#FFFFFF',
	black: '#000000',

	// Light-theme neutrals. 50/100/400/900 are the four reference colors
	// from light-theme-palette.png; the rest are in-between steps.
	mist: {
		0: '#FFFFFF',
		50: '#F7F7F7', // page background
		100: '#EEEEEE', // surface / default border
		200: '#E2E3E7',
		300: '#C9CDD5',
		400: '#929AAB', // muted — placeholder, muted border
		600: '#5E6573', // secondary text (400 is too light for text on 50)
		900: '#393E46', // ink — primary text
	},

	// Dark-theme neutrals. 950/900/400/50 are from frontend-plan §5.2;
	// 850/800 match the Stitch design system's surface-elevated/-border.
	night: {
		950: '#0B0D12', // page background
		900: '#14171F', // surface / card
		850: '#1C202B', // elevated surface
		800: '#282D3B', // default border
		700: '#3A4052', // strong border
		500: '#6B7280', // placeholder
		400: '#9CA3AF', // muted — secondary text
		50: '#F2F2F2', // ink — primary text
	},

	// Brand accent — warm red-orange. 300/500/600 are the three accent
	// values from frontend-plan §5.2 (subtle/default/emphasis).
	coral: {
		50: '#FFF1EE',
		100: '#FFDDD5',
		200: '#FFB4A5',
		300: '#FF8C70',
		500: '#FF5B3D',
		600: '#E8482C',
		700: '#C2381F',
		800: '#8E1F0B',
		900: '#4A0F04',
	},

	// Semantic hues — kept visibly apart from coral (frontend-plan §3:
	// error must never read as the brand accent).
	crimson: { 300: '#FF7A90', 500: '#E11D48', 700: '#B4123A' },
	emerald: { 300: '#34D399', 500: '#10B981', 700: '#047857' },
	amber: { 300: '#FCD34D', 500: '#F59E0B', 700: '#B45309' },
	azure: { 300: '#7CB4FF', 500: '#3B82F6', 700: '#1D4ED8' },
	violet: { 300: '#C4B5FD', 500: '#8B5CF6', 700: '#6D28D9' },
};

// Hex + alpha → rgba(). For tints/overlays, so they stay tied to a
// palette color instead of a second hand-typed value.
export const alpha = (hex, opacity) => {
	const value = hex.replace('#', '');
	const r = parseInt(value.slice(0, 2), 16);
	const g = parseInt(value.slice(2, 4), 16);
	const b = parseInt(value.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
