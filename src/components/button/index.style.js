import styled, { css } from 'styled-components';

const variants = {
	primary: css`
		background-color: ${({ theme }) => theme.button.primaryBg};
		color: ${({ theme }) => theme.button.primaryText};
		border-color: ${({ theme }) => theme.button.primaryBg};

		&:hover {
			background-color: ${({ theme }) => theme.button.primaryHover};
			border-color: ${({ theme }) => theme.button.primaryHover};
		}
	`,
	secondary: css`
		background-color: ${({ theme }) => theme.button.secondaryBg};
		color: ${({ theme }) => theme.button.secondaryText};
		border-color: ${({ theme }) => theme.button.secondaryBorder};

		&:hover {
			background-color: ${({ theme }) => theme.button.secondaryHover};
		}
	`,
};

const sizes = {
	md: css`
		height: 46px;
		padding: 0 22px;
		font-size: 13px;
	`,
	sm: css`
		height: 38px;
		padding: 0 16px;
		font-size: 12px;
	`,
};

export const ButtonBase = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	border: 1px solid transparent;
	border-radius: 8px;
	font-family: var(--font-label);
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	text-decoration: none;
	white-space: nowrap;
	transition:
		background-color 0.2s ease,
		border-color 0.2s ease,
		transform 0.2s ease;

	${({ $size }) => sizes[$size] || sizes.md}
	${({ $variant }) => variants[$variant] || variants.primary}

	.sc_btnIcon {
		font-size: 1.25em;
		transition: transform 0.2s ease;
	}

	&:hover .sc_btnIcon {
		transform: translateX(3px);
	}

	&:active {
		transform: translateY(1px);
	}

	&:disabled {
		opacity: ${({ theme }) => theme.state.disabledOpacity};
		pointer-events: none;
	}
`;

// Text link with a trailing arrow — "Browse catalog →".
export const ArrowLinkBase = styled.a`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-family: var(--font-label);
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	text-decoration: none;
	color: ${({ theme }) => theme.text.link};

	.sc_btnIcon {
		font-size: 1.2em;
		transition: transform 0.2s ease;
	}

	&:hover .sc_btnIcon {
		transform: translateX(4px);
	}
`;
