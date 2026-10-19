import styled, { css } from 'styled-components';

export const NavWrapper = styled.header`
	position: sticky;
	top: 0;
	z-index: 50;
	width: 100%;
	background-color: ${({ theme }) => theme.navbar.background};
	border-bottom: 1px solid ${({ theme }) => theme.navbar.border};
	backdrop-filter: blur(14px);
	-webkit-backdrop-filter: blur(14px);

	/* Slides in as the intro lifts away (HM's "aftermath"). */
	transition:
		transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
		opacity 0.7s ease;
	${({ $ready }) =>
		!$ready &&
		css`
			transform: translateY(-100%);
			opacity: 0;
		`}

	.sc_link {
		position: relative;
		font-family: var(--font-label);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.navbar.link};
		transition: color 0.2s ease;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			bottom: -6px;
			width: 100%;
			height: 2px;
			border-radius: 2px;
			background-color: ${({ theme }) => theme.accent.default};
			transform: scaleX(0);
			transform-origin: left;
			transition: transform 0.25s ease;
		}

		&:hover,
		&.active {
			color: ${({ theme }) => theme.navbar.linkHover};
		}

		&:hover::after,
		&.active::after {
			transform: scaleX(1);
		}
	}

	.sc_iconBtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		font-size: 19px;
		color: ${({ theme }) => theme.navbar.link};
		transition:
			background-color 0.2s ease,
			color 0.2s ease;

		&:hover {
			color: ${({ theme }) => theme.navbar.linkHover};
			background-color: ${({ theme }) => theme.state.hover};
		}
	}
`;

// Mobile menu panel, dropping down under the bar.
export const MobileMenu = styled.div`
	overflow: hidden;
	background-color: ${({ theme }) => theme.navbar.menuBg};
	border-top: 1px solid ${({ theme }) => theme.navbar.border};
	display: grid;
	grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
	transition: grid-template-rows 0.35s ease;

	.sc_inner {
		min-height: 0;
	}

	.sc_link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 0;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
		border-bottom: 1px solid ${({ theme }) => theme.navbar.border};

		&.active {
			color: ${({ theme }) => theme.accent.default};
		}
	}
`;
