import styled from 'styled-components';

export const LabSection = styled.section`
	border-radius: 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.card.background};

	.sc_head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 24px;
		padding: 22px 24px;
		border-bottom: 1px solid ${({ theme }) => theme.card.border};
	}

	.sc_title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_note {
		max-width: 560px;
		font-size: 14px;
		line-height: 1.5;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_body {
		padding: 24px;
	}
`;

// Small uppercase caption over each demo ("Error + filled", …)
export const StateTag = styled.p`
	margin-bottom: 10px;
	font-family: var(--font-label);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.text.highlight};
`;

export const CodeBlock = styled.pre`
	overflow-x: auto;
	padding: 16px;
	border-radius: 10px;
	font-family: ui-monospace, monospace;
	font-size: 13px;
	line-height: 1.55;
	background-color: ${({ theme }) => theme.surface.sunken};
	color: ${({ theme }) => theme.text.primary};
`;
