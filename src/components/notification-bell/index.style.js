import styled from 'styled-components';
import { popoverSurface } from '../form-components/select/index.style';

export const BellButton = styled.button`
	position: relative;
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

	&:hover,
	&[aria-expanded='true'] {
		background-color: ${({ theme }) => theme.state.hover};
		color: ${({ theme }) => theme.text.primary};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_badge {
		position: absolute;
		top: -6px;
		right: -6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 19px;
		height: 19px;
		padding: 0 5px;
		border: 2px solid ${({ theme }) => theme.surface.card};
		border-radius: 999px;
		font-family: var(--font-label);
		font-size: 10px;
		font-weight: 700;
		background-color: ${({ theme }) => theme.badge.background};
		color: ${({ theme }) => theme.badge.text};
	}
`;

export const BellPanel = styled.div`
	${popoverSurface}

	&[popover] {
		width: min(380px, calc(100vw - 24px));
		max-height: min(520px, 75vh);
		overflow: hidden;
		padding: 0;
		border-color: ${({ theme }) => theme.card.border};
		background-color: ${({ theme }) => theme.navbar.menuBg};
		color: ${({ theme }) => theme.text.primary};
	}

	&:popover-open {
		display: flex;
		flex-direction: column;
	}

	@supports (anchor-name: --a) {
		&[popover] {
			position-area: block-end span-inline-start;
			margin-top: 8px;
			position-try-fallbacks: flip-block;
		}
	}

	.sc_head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border-bottom: 1px solid ${({ theme }) => theme.card.border};
	}

	.sc_list {
		flex: 1;
		overflow-y: auto;
	}

	.sc_foot {
		padding: 10px 16px;
		border-top: 1px solid ${({ theme }) => theme.card.border};
		text-align: center;
	}
`;

// One notification — shared by the bell and the notifications page.
export const NotificationItem = styled.button`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: 100%;
	padding: 12px 16px;
	text-align: left;
	transition: background-color 0.18s ease;

	&:hover,
	&:focus-visible {
		outline: none;
		background-color: ${({ theme }) => theme.state.hover};
	}

	.sc_icon {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 10px;
		font-size: 17px;
		background-color: ${({ theme, $tone }) => theme.status[`${$tone}Soft`]};
		color: ${({ theme, $tone }) => theme.status[$tone]};
	}

	.sc_message {
		font-size: 14.5px;
		line-height: 1.45;
		color: ${({ theme, $read }) => ($read ? theme.text.secondary : theme.text.primary)};
		font-weight: ${({ $read }) => ($read ? 400 : 600)};
	}

	.sc_time {
		display: block;
		margin-top: 3px;
		font-size: 12.5px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_dot {
		flex-shrink: 0;
		width: 8px;
		height: 8px;
		margin-top: 6px;
		border-radius: 50%;
		background-color: ${({ theme }) => theme.accent.default};
	}
`;
