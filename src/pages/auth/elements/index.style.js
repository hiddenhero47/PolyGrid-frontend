import styled from 'styled-components';

export const AuthHeading = styled.header`
	margin-bottom: 32px;

	.sc_eyebrow {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.accent.default};
	}

	.sc_title {
		margin-top: 10px;
		font-family: var(--font-display);
		font-size: clamp(34px, 5vw, 44px);
		font-weight: 600;
		line-height: 1.02;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_subtitle {
		margin-top: 12px;
		font-size: 16px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};

		strong {
			font-weight: 600;
			color: ${({ theme }) => theme.text.primary};
		}
	}
`;

// "Don't have an account? Join" row under a form
export const AuthSwitch = styled.p`
	margin-top: 28px;
	font-size: 15px;
	text-align: center;
	color: ${({ theme }) => theme.text.secondary};

	a,
	button {
		font-weight: 600;
		color: ${({ theme }) => theme.text.link};

		&:hover {
			text-decoration: underline;
		}
	}
`;

// Confirmation panel (email sent, password changed)
export const AuthNotice = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 14px;

	.sc_icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: 16px;
		font-size: 26px;
		background-color: ${({ theme }) => theme.icon.successBackground};
		border: 1px solid ${({ theme }) => theme.icon.successBorder};
		color: ${({ theme }) => theme.icon.successColor};
	}
`;
