import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

// Shared by every admin page.

const tile = css`
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 16px;
	background-color: ${({ theme }) => theme.surface.background};
	transition:
		border-color 0.2s ease,
		transform 0.2s ease;

	.sc_top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.sc_label {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		font-size: 18px;
		background-color: ${({ theme }) => theme.icon.background};
		color: ${({ theme }) => theme.icon.color};
	}

	.sc_value {
		font-family: var(--font-display);
		font-size: 34px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.02em;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_note {
		font-size: 13.5px;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

// A number with a label — `$attention` marks a queue with work waiting.
export const StatTile = styled.div`
	${tile};

	${({ $attention }) =>
		$attention &&
		css`
			border-color: ${({ theme }) => theme.accent.default};
			background-color: ${({ theme }) => theme.accent.soft};

			.sc_icon {
				background-color: ${({ theme }) => theme.icon.accentBackground};
				color: ${({ theme }) => theme.icon.accentColor};
			}
		`}
`;

export const StatTileLink = styled(StatTile).attrs({ as: Link })`
	&:hover {
		border-color: ${({ theme }) => theme.card.borderHover};
		transform: translateY(-2px);
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		&:hover {
			transform: none;
		}
	}
`;

// A titled block inside the page card.
export const AdminSection = styled.section`
	& + & {
		margin-top: 36px;
	}

	.sc_sectionHead {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 14px;
	}

	.sc_sectionTitle {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

// Status tabs above a queue (pending / approved / rejected).
export const QueueTabs = styled.div`
	display: inline-flex;
	flex-wrap: wrap;
	gap: 4px;
	padding: 4px;
	border: 1px solid ${({ theme }) => theme.border.default};
	border-radius: 14px;
	background-color: ${({ theme }) => theme.surface.background};

	button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding: 0 14px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.18s ease,
			color 0.18s ease;

		&:hover {
			color: ${({ theme }) => theme.text.primary};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 2px;
		}

		&[aria-pressed='true'] {
			background-color: ${({ theme }) => theme.tab.activeBg};
			color: ${({ theme }) => theme.tab.activeText};
		}
	}
`;
