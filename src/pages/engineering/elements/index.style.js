import styled from 'styled-components';

// Page header band shared by the browse + profile pages
export const PageBand = styled.section`
	position: relative;
	overflow: hidden;
	border-bottom: 1px solid ${({ theme }) => theme.card.border};

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 55% 90% at 100% 0%,
			${({ theme }) => theme.hero.glow},
			transparent 70%
		);
	}

	.sc_title {
		font-family: var(--font-display);
		font-size: clamp(36px, 5vw, 60px);
		font-weight: 700;
		line-height: 1;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_subtitle {
		max-width: 720px;
		margin-top: 14px;
		font-size: 17px;
		line-height: 1.6;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

export const FilterPanel = styled.div`
	display: flex;
	flex-direction: column;
	gap: 28px;

	.sc_head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_reset {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.link};

		&:disabled {
			color: ${({ theme }) => theme.text.disabled};
		}
	}
`;

// A removable "active filter" pill
export const FilterPill = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px 6px 12px;
	border-radius: 999px;
	font-family: var(--font-label);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	border: 1px solid ${({ theme }) => theme.chip.accentBorder};
	background-color: ${({ theme }) => theme.chip.accentBg};
	color: ${({ theme }) => theme.chip.accentText};
	transition: border-color 0.15s ease;

	&:hover {
		border-color: ${({ theme }) => theme.chip.accentText};
	}

	.sc_x {
		font-size: 14px;
	}
`;

export const ConsultantCardShell = styled.article`
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 18px;
	height: 100%;
	padding: 22px;
	border-radius: 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.card.background};
	transition:
		border-color 0.2s ease,
		transform 0.2s ease;

	&:hover,
	&:focus-within {
		border-color: ${({ theme }) => theme.card.borderHover};
	}

	&:hover {
		transform: translateY(-2px);
	}

	/* the whole card is the link (stretched over it) */
	.sc_link::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.sc_link:focus-visible {
		outline: none;
	}

	&:has(.sc_link:focus-visible) {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_headline {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		line-height: 1.12;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 14px;
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_bio {
		display: -webkit-box;
		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		font-size: 15px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid ${({ theme }) => theme.card.border};
	}

	.sc_price {
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};

		strong {
			font-weight: 600;
			color: ${({ theme }) => theme.text.primary};
		}
	}

	.sc_cta {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.link};
	}
`;
