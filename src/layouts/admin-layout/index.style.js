import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

// HM's dashboard shape — floating panels on the page background: a side
// menu card, a top bar card and the page card — in PolyGrid's colors.

export const DESKTOP = '(min-width: 1024px)';
const SIDEBAR_WIDTH = 'clamp(248px, 22vw, 272px)';
const SIDEBAR_COLLAPSED = '78px';

export const AdminShell = styled.div`
	display: flex;
	gap: 12px;
	min-height: 100vh;
	padding: 12px;
	background-color: ${({ theme }) => theme.surface.background};

	@media ${DESKTOP} {
		gap: 14px;
		padding: 14px;
	}
`;

const panel = css`
	border: 1px solid ${({ theme }) => theme.sidebar.border};
	border-radius: 18px;
	background-color: ${({ theme }) => theme.sidebar.background};
`;

export const SideCard = styled.aside`
	${panel};
	display: none;

	@media ${DESKTOP} {
		position: sticky;
		top: 14px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		width: ${({ $collapsed }) =>
			$collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH};
		height: calc(100vh - 28px);
		overflow: hidden;
		transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}
`;

// The menu itself — shared by the desktop card and the mobile drawer.
export const NavShell = styled.nav`
	display: flex;
	flex: 1;
	flex-direction: column;
	min-height: 0;

	.sc_brand {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-height: 72px;
		padding: 16px 18px;
		border-bottom: 1px solid ${({ theme }) => theme.sidebar.border};
	}

	.sc_console {
		display: block;
		margin-top: 6px;
		font-family: var(--font-label);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_sections {
		flex: 1;
		overflow-y: auto;
		padding: 14px 12px;
		scrollbar-width: thin;
	}

	.sc_section + .sc_section {
		margin-top: 18px;
	}

	.sc_heading {
		height: 18px;
		margin: 0 0 6px;
		padding: 0 12px;
		overflow: hidden;
		font-family: var(--font-label);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		white-space: nowrap;
		color: ${({ theme }) => theme.sidebar.heading};
	}

	.sc_footer {
		padding: 12px;
		border-top: 1px solid ${({ theme }) => theme.sidebar.border};
	}

	${({ $collapsed }) =>
		$collapsed &&
		css`
			.sc_brand {
				justify-content: center;
				padding-inline: 0;
			}
			.sc_heading {
				height: 1px;
				margin: 0 12px 10px;
				padding: 0;
				font-size: 0;
				background-color: ${({ theme }) => theme.sidebar.border};
			}
			.sc_label,
			.sc_soon {
				display: none;
			}
		`}
`;

const navItem = css`
	position: relative;
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	min-height: 44px;
	padding: 0 12px;
	border-radius: 12px;
	font-size: 15px;
	font-weight: 500;
	white-space: nowrap;
	color: ${({ theme }) => theme.sidebar.link};
	transition:
		background-color 0.18s ease,
		color 0.18s ease;

	.sc_navIcon {
		flex-shrink: 0;
		font-size: 19px;
	}

	.sc_label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sc_count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 7px;
		border-radius: 999px;
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 700;
		background-color: ${({ theme }) => theme.badge.background};
		color: ${({ theme }) => theme.badge.text};
	}

	${({ $collapsed }) =>
		$collapsed &&
		css`
			justify-content: center;
			padding: 0;

			.sc_count {
				position: absolute;
				top: 4px;
				right: 6px;
				min-width: 9px;
				height: 9px;
				padding: 0;
				font-size: 0;
			}
		`}
`;

export const NavItemLink = styled(NavLink)`
	${navItem};

	&:hover {
		background-color: ${({ theme }) => theme.state.hover};
		color: ${({ theme }) => theme.sidebar.linkHover};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	&.active {
		background-color: ${({ theme }) => theme.sidebar.activeBg};
		color: ${({ theme }) => theme.sidebar.activeText};
		font-weight: 600;
	}

	&.active .sc_count {
		background-color: ${({ theme }) => theme.sidebar.activeText};
		color: ${({ theme }) => theme.sidebar.activeBg};
	}
`;

export const NavItemSoon = styled.span`
	${navItem};
	cursor: default;
	opacity: 0.5;

	.sc_soon {
		font-family: var(--font-label);
		font-size: 9.5px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
`;

export const MainColumn = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 12px;
	min-width: 0;

	@media ${DESKTOP} {
		gap: 14px;
	}
`;

export const TopBar = styled.header`
	${panel};
	position: sticky;
	top: 12px;
	z-index: 20;
	display: flex;
	align-items: center;
	gap: 12px;
	min-height: 64px;
	padding: 10px 14px;
	backdrop-filter: blur(12px);

	@media ${DESKTOP} {
		top: 14px;
		padding: 10px 18px;
	}

	.sc_title {
		min-width: 0;
		flex: 1;
	}

	.sc_eyebrow {
		display: block;
		font-family: var(--font-label);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_page {
		display: block;
		overflow: hidden;
		font-size: 15px;
		font-weight: 600;
		line-height: 1.3;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: ${({ theme }) => theme.text.primary};
	}
`;

export const IconButton = styled.button`
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: 1px solid ${({ theme }) => theme.border.default};
	border-radius: 12px;
	font-size: 18px;
	color: ${({ theme }) => theme.text.secondary};
	transition:
		background-color 0.18s ease,
		color 0.18s ease;

	&:hover {
		background-color: ${({ theme }) => theme.state.hover};
		color: ${({ theme }) => theme.text.primary};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}
`;

export const PageCard = styled.main`
	${panel};
	flex: 1;
	min-width: 0;
	padding: 20px 16px 32px;

	@media (min-width: 768px) {
		padding: 28px 28px 40px;
	}
`;
