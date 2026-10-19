import styled, { css, keyframes } from 'styled-components';

// ── Shared ───────────────────────────────────────────────────────────

export const Eyebrow = styled.p`
	font-family: var(--font-label);
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	/* $highlight: pillar / item labels — coral in dark, slate in light */
	color: ${({ theme, $highlight }) =>
		$highlight ? theme.text.highlight : theme.accent.default};
`;

export const Chip = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	border-radius: 6px;
	font-family: var(--font-label);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	border: 1px solid
		${({ theme, $accent }) => ($accent ? theme.chip.accentBorder : theme.chip.border)};
	background-color: ${({ theme, $accent }) =>
		$accent ? theme.chip.accentBg : theme.chip.background};
	color: ${({ theme, $accent }) =>
		$accent ? theme.chip.accentText : theme.chip.text};
`;

export const Card = styled.div`
	position: relative;
	border-radius: 18px;
	background-color: ${({ theme }) => theme.card.background};
	border: 1px solid ${({ theme }) => theme.card.border};
	transition: border-color 0.25s ease;

	${({ $hoverable }) =>
		$hoverable &&
		css`
			&:hover {
				border-color: ${({ theme }) => theme.card.borderHover};
			}
		`}
`;

// A photo with the theme's overlay gradient on top, so text laid over the
// bottom of it stays readable.
export const ImagePanel = styled.div`
	position: relative;
	overflow: hidden;
	border-radius: ${({ $flat }) => ($flat ? '0' : '14px')};
	background-color: ${({ theme }) => theme.surface.sunken};

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		background: ${({ theme, $hero }) =>
			$hero ? theme.hero.imageOverlay : theme.card.imageOverlay};
		pointer-events: none;
	}

	> .sc_layer {
		position: relative;
		z-index: 1;
		height: 100%;
	}

	&:hover img {
		transform: scale(1.03);
	}
`;

// Frosted label sitting on top of a photo (glass tokens).
export const GlassTag = styled.div`
	display: inline-flex;
	flex-direction: column;
	gap: 4px;
	padding: 12px 16px;
	border-radius: 10px;
	background-color: ${({ theme }) => theme.glass.background};
	border: 1px solid ${({ theme }) => theme.glass.border};
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	color: ${({ theme }) => theme.glass.text};

	.sc_label {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.glass.sbText};
	}

	.sc_value {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.sc_accent {
		color: ${({ theme }) => theme.accent.subtle};
	}
`;

// Frosted icon + title + sentence, laid over a photo.
export const GlassNote = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 14px 16px;
	border-radius: 10px;
	background-color: ${({ theme }) => theme.glass.background};
	border: 1px solid ${({ theme }) => theme.glass.border};
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);

	.sc_title {
		font-family: var(--font-label);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.glass.text};
	}

	.sc_text {
		font-size: 14px;
		line-height: 1.45;
		color: ${({ theme }) => theme.glass.sbText};
	}
`;

// $tone: 'default' | 'accent' | 'success' (icon tokens)
const iconTone = {
	default: ['background', 'border', 'color'],
	accent: ['accentBackground', 'accentBorder', 'accentColor'],
	success: ['successBackground', 'successBorder', 'successColor'],
};

export const IconBox = styled.span`
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: ${({ $size }) => $size || 44}px;
	height: ${({ $size }) => $size || 44}px;
	border-radius: 10px;
	font-size: ${({ $size }) => ($size ? $size * 0.48 : 21)}px;
	${({ theme, $tone }) => {
		const [bg, border, color] = iconTone[$tone] || iconTone.default;
		return css`
			background-color: ${theme.icon[bg]};
			border: 1px solid ${theme.icon[border]};
			color: ${theme.icon[color]};
		`;
	}}
`;

// ── Hero ─────────────────────────────────────────────────────────────

export const HeroGlow = styled.div`
	position: absolute;
	inset: 0;
	pointer-events: none;
	background:
		radial-gradient(
			ellipse 60% 55% at 0% 30%,
			${({ theme }) => theme.hero.glow},
			transparent 70%
		),
		radial-gradient(
			ellipse 50% 50% at 100% 100%,
			${({ theme }) => theme.hero.glow},
			transparent 70%
		);
`;

export const HeroTitle = styled.h1`
	font-family: var(--font-display);
	font-size: clamp(44px, 6.4vw, 84px);
	font-weight: 700;
	line-height: 0.98;
	letter-spacing: 0.005em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.text.primary};

	.sc_accent {
		display: block;
		color: ${({ theme }) => theme.accent.default};
	}
`;

// ── Section headings ─────────────────────────────────────────────────

export const SectionTitle = styled.h2`
	font-family: var(--font-display);
	font-size: clamp(32px, 4.4vw, 56px);
	font-weight: 600;
	line-height: 1.02;
	text-transform: uppercase;
	color: ${({ theme }) => theme.text.primary};
`;

export const BlockTitle = styled.h3`
	font-family: var(--font-display);
	font-size: clamp(26px, 3vw, 38px);
	font-weight: 600;
	line-height: 1.08;
	text-transform: uppercase;
	color: ${({ theme }) => theme.text.primary};
`;

export const NumberBadge = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border-radius: 6px;
	font-family: var(--font-display);
	font-size: 17px;
	font-weight: 600;
	background-color: ${({ theme }) => theme.badge.background};
	color: ${({ theme }) => theme.badge.text};
`;

// ── Top rated ────────────────────────────────────────────────────────

export const Tabs = styled.div`
	display: inline-flex;
	flex-wrap: wrap;
	gap: 4px;
	padding: 4px;
	border-radius: 10px;
	background-color: ${({ theme }) => theme.card.background};
	border: 1px solid ${({ theme }) => theme.card.border};

	.sc_tab {
		padding: 9px 14px;
		border-radius: 7px;
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.2s ease,
			color 0.2s ease;

		&:hover {
			color: ${({ theme }) => theme.text.primary};
		}

		&[aria-selected='true'] {
			background-color: ${({ theme }) => theme.tab.activeBg};
			color: ${({ theme }) => theme.tab.activeText};
		}
	}
`;

export const Avatar = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 56px;
	height: 56px;
	border-radius: 14px;
	font-family: var(--font-display);
	font-size: 22px;
	font-weight: 600;
	text-transform: uppercase;
	background-color: ${({ theme }) => theme.icon.accentBackground};
	color: ${({ theme }) => theme.icon.accentColor};
	border: 1px solid ${({ theme }) => theme.icon.accentBorder};
`;

const shimmer = keyframes`
	from { background-position: -200% 0; }
	to { background-position: 200% 0; }
`;

export const Skeleton = styled.div`
	border-radius: ${({ $radius }) => $radius ?? 8}px;
	background: linear-gradient(
		90deg,
		${({ theme }) => theme.skeleton.base} 25%,
		${({ theme }) => theme.skeleton.highlight} 50%,
		${({ theme }) => theme.skeleton.base} 75%
	);
	background-size: 200% 100%;
	animation: ${shimmer} 1.4s linear infinite;
`;

// ── Live band / persona ──────────────────────────────────────────────

const pulse = keyframes`
	0% { box-shadow: 0 0 0 0 currentColor; }
	70% { box-shadow: 0 0 0 8px transparent; }
	100% { box-shadow: 0 0 0 0 transparent; }
`;

export const LiveDot = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	color: ${({ theme }) => theme.status.success};
	background-color: currentColor;
	animation: ${pulse} 1.8s ease-out infinite;
`;

export const PersonaRow = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 14px 16px;
	border-radius: 12px;
	border: 1px solid
		${({ theme, $active }) =>
			$active ? theme.accent.default : theme.card.border};
	background-color: ${({ theme, $active }) =>
		$active ? theme.icon.accentBackground : theme.surface.sunken};

	.sc_title {
		font-family: var(--font-label);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_sub {
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_switch {
		margin-left: auto;
		position: relative;
		width: 38px;
		height: 22px;
		flex-shrink: 0;
		border-radius: 999px;
		background-color: ${({ theme, $active }) =>
			$active ? theme.accent.default : theme.border.strong};

		&::after {
			content: '';
			position: absolute;
			top: 3px;
			left: ${({ $active }) => ($active ? '19px' : '3px')};
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background-color: ${({ theme }) => theme.surface.card};
			transition: left 0.25s ease;
		}
	}
`;
