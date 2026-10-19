import styled from 'styled-components';

export const PaginationWrapper = styled.nav`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 12px 20px;
	width: 100%;

	.sc_summary {
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
		font-variant-numeric: tabular-nums;

		strong {
			font-weight: 600;
			color: ${({ theme }) => theme.text.primary};
		}
	}

	.sc_pages {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
	}

	.sc_page,
	.sc_arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		height: 36px;
		padding: 0 8px;
		border-radius: 8px;
		font-family: var(--font-label);
		font-size: 13px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.15s ease,
			color 0.15s ease;

		&:hover {
			background-color: ${({ theme }) => theme.state.hover};
			color: ${({ theme }) => theme.text.primary};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 1px;
		}

		&:disabled {
			opacity: 0.35;
			pointer-events: none;
		}
	}

	.sc_arrow {
		font-size: 17px;
		border: 1px solid ${({ theme }) => theme.card.border};
	}

	.sc_page[aria-current='page'] {
		background-color: ${({ theme }) => theme.tab.activeBg};
		color: ${({ theme }) => theme.tab.activeText};
	}

	.sc_gap {
		min-width: 24px;
		text-align: center;
		color: ${({ theme }) => theme.text.secondary};
	}
`;
