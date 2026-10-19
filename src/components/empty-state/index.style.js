import styled, { keyframes } from 'styled-components';

const rise = keyframes`
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: translateY(0); }
`;

const TONES = {
	neutral: ['icon', 'background', 'border', 'color'],
	accent: ['icon', 'accentBackground', 'accentBorder', 'accentColor'],
	success: ['icon', 'successBackground', 'successBorder', 'successColor'],
};

export const EmptyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	max-width: 520px;
	margin-inline: auto;
	padding: ${({ $compact }) => ($compact ? '32px 16px' : '64px 16px')};
	text-align: center;
	animation: ${rise} 0.35s ease;

	.sc_icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		margin-bottom: 10px;
		border-radius: 18px;
		font-size: 28px;
		${({ theme, $tone }) => {
			if ($tone === 'error') {
				return `
					background-color: ${theme.status.errorSoft};
					color: ${theme.status.error};
				`;
			}
			const [group, bg, border, color] = TONES[$tone] || TONES.neutral;
			return `
				background-color: ${theme[group][bg]};
				border: 1px solid ${theme[group][border]};
				color: ${theme[group][color]};
			`;
		}}
	}

	.sc_eyebrow {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_title {
		font-family: var(--font-display);
		font-size: clamp(26px, 3.4vw, 34px);
		font-weight: 600;
		line-height: 1.08;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_text {
		max-width: 420px;
		font-size: 16px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 18px;
	}
`;
