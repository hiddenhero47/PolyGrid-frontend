import styled from 'styled-components';

export const TenderTile = styled.article`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 14px;
	padding: 24px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 18px;
	background-color: ${({ theme }) => theme.card.background};

	.sc_tileIcon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 46px;
		height: 46px;
		border-radius: 12px;
		font-size: 22px;
		background-color: ${({ theme }) => theme.icon.accentBackground};
		color: ${({ theme }) => theme.icon.accentColor};
	}

	.sc_tileTitle {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_tileText {
		flex: 1;
		font-size: 15px;
		line-height: 1.6;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

// A per-category count — deliberately not a link (nothing public to open).
export const CountTile = styled.li`
	display: flex;
	align-items: baseline;
	gap: 12px;
	padding: 16px 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 14px;
	background-color: ${({ theme }) => theme.card.background};

	.sc_count {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 600;
		line-height: 1;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_label {
		font-size: 15px;
		color: ${({ theme }) => theme.text.primary};
	}
`;
