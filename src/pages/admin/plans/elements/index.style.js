import styled from 'styled-components';

// One tier's plan (or the empty slot for it).
export const TierCard = styled.article`
	display: flex;
	flex-direction: column;
	gap: 18px;
	padding: 22px;
	border: 1px solid
		${({ theme, $featured }) =>
			$featured ? theme.accent.default : theme.card.border};
	border-radius: 18px;
	background-color: ${({ theme }) => theme.surface.background};

	&[data-empty='true'] {
		border-style: dashed;
		justify-content: center;
		min-height: 280px;
	}

	.sc_tier {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_name {
		margin-top: 4px;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_price {
		font-family: var(--font-display);
		font-size: 38px;
		font-weight: 600;
		line-height: 1;
		color: ${({ theme }) => theme.text.primary};

		small {
			margin-left: 6px;
			font-family: var(--font-sans);
			font-size: 14px;
			font-weight: 500;
			color: ${({ theme }) => theme.text.secondary};
		}
	}

	.sc_privileges {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 8px;
		font-size: 14.5px;
		color: ${({ theme }) => theme.text.secondary};

		li {
			display: flex;
			gap: 8px;
		}

		svg {
			flex-shrink: 0;
			margin-top: 3px;
			color: ${({ theme }) => theme.status.success};
		}
	}
`;
