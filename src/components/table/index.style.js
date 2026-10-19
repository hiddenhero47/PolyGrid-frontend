import styled, { css, keyframes } from 'styled-components';

export const TableFrame = styled.div`
	display: flex;
	flex-direction: column;
	gap: 14px;
	width: 100%;
`;

export const TableScroll = styled.div`
	width: 100%;
	max-height: ${({ $maxHeight }) => $maxHeight || 'none'};
	overflow: auto;
	border-radius: 12px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.card.background};

	table {
		width: 100%;
		min-width: max-content;
		border-collapse: separate;
		border-spacing: 0;
		color: ${({ theme }) => theme.table.cellText};
	}

	thead th {
		padding: ${({ $padHeadY, $padHeadX }) => `${$padHeadY} ${$padHeadX}`};
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-align: left;
		white-space: nowrap;
		color: ${({ theme }) => theme.table.headerText};
		border-bottom: 1px solid ${({ theme }) => theme.table.rowBorder};

		${({ $headerBg }) =>
			$headerBg &&
			css`
				background-color: ${({ theme }) => theme.table.headerBg};
			`}

		/* header stays visible while the body scrolls */
		${({ $sticky }) =>
			$sticky &&
			css`
				position: sticky;
				top: 0;
				z-index: 1;
			`}
	}

	tbody td {
		padding: ${({ $padCellY, $padCellX }) => `${$padCellY} ${$padCellX}`};
		font-size: 14px;
		white-space: nowrap;
		vertical-align: middle;

		${({ $bodyBg }) =>
			$bodyBg &&
			css`
				border-bottom: 1px solid ${({ theme }) => theme.table.rowBorder};
			`}
	}

	/* extra breathing room on the outer edges, like HM */
	th:first-child,
	td:first-child {
		padding-left: ${({ $padCellX }) => `calc(${$padCellX} * 2)`};
	}

	th:last-child,
	td:last-child {
		padding-right: ${({ $padCellX }) => `calc(${$padCellX} * 2)`};
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	${({ $useStrip }) =>
		$useStrip &&
		css`
			tbody tr:nth-child(even) {
				background-color: ${({ theme }) => theme.table.stripe};
			}
		`}

	.sc_align_right {
		text-align: right;
	}

	.sc_align_center {
		text-align: center;
	}

	/* clickable rows: hover, keyboard focus */
	tr.sc_clickable {
		cursor: pointer;
		transition: background-color 0.12s ease;

		&:hover {
			background-color: ${({ theme }) => theme.table.rowHover};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: -2px;
		}
	}
`;

const shimmer = keyframes`
	from { background-position: -200% 0; }
	to { background-position: 200% 0; }
`;

export const SkeletonBar = styled.span`
	display: block;
	height: 12px;
	width: ${({ $width }) => $width};
	border-radius: 6px;
	background: linear-gradient(
		90deg,
		${({ theme }) => theme.skeleton.base} 25%,
		${({ theme }) => theme.skeleton.highlight} 50%,
		${({ theme }) => theme.skeleton.base} 75%
	);
	background-size: 200% 100%;
	animation: ${shimmer} 1.4s linear infinite;
`;

const rise = keyframes`
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: translateY(0); }
`;

// Empty and error states (HM's NoData), shown under the header row.
export const TableMessage = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 48px 20px;
	text-align: center;
	animation: ${rise} 0.35s ease;

	.sc_icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		margin-bottom: 8px;
		border-radius: 14px;
		font-size: 24px;
		background-color: ${({ theme, $error }) =>
			$error ? theme.status.errorSoft : theme.icon.background};
		color: ${({ theme, $error }) =>
			$error ? theme.status.error : theme.icon.color};
	}

	.sc_title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_text {
		max-width: 380px;
		font-size: 14px;
		line-height: 1.5;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_actions {
		display: flex;
		gap: 10px;
		margin-top: 12px;
	}
`;
