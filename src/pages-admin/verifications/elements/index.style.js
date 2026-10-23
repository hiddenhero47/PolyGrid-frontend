import styled from 'styled-components';

// One verification in the queue (Stitch §C.1's review card).
export const ReviewCard = styled.article`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 18px;
	background-color: ${({ theme }) => theme.surface.background};

	.sc_who {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 14px;
	}

	.sc_name {
		font-size: 17px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		margin-top: 4px;
		font-size: 13.5px;
		color: ${({ theme }) => theme.text.secondary};

		span {
			display: inline-flex;
			align-items: center;
			gap: 6px;
		}
	}

	.sc_details {
		display: grid;
		gap: 10px 24px;
		padding: 14px 16px;
		border-radius: 12px;
		background-color: ${({ theme }) => theme.surface.card};

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.sc_term {
		font-family: var(--font-label);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_def {
		margin-top: 2px;
		font-size: 15px;
		overflow-wrap: anywhere;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		padding-top: 16px;
		border-top: 1px solid ${({ theme }) => theme.card.border};
	}
`;

// A submitted document — opens a short-lived signed link.
export const DocChip = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-height: 38px;
	padding: 0 14px;
	border: 1px solid ${({ theme }) => theme.chip.border};
	border-radius: 10px;
	background-color: ${({ theme }) => theme.chip.background};
	font-size: 14px;
	font-weight: 500;
	color: ${({ theme }) => theme.chip.text};
	transition: border-color 0.18s ease;

	.sc_docIcon {
		font-size: 16px;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_size {
		color: ${({ theme }) => theme.text.secondary};
		font-size: 12.5px;
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.card.borderHover};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	&:disabled {
		cursor: progress;
		opacity: 0.6;
	}
`;
