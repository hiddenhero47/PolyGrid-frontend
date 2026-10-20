import styled from 'styled-components';
import { popoverSurface } from '../form-components/select/index.style';

export const MenuTrigger = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 10px;
	max-width: 260px;
	padding: 4px 8px 4px 4px;
	border-radius: 12px;
	text-align: left;
	transition: background-color 0.18s ease;

	&:hover,
	&[aria-expanded='true'] {
		background-color: ${({ theme }) => theme.state.hover};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_chevron {
		flex-shrink: 0;
		color: ${({ theme }) => theme.text.secondary};
		transition: transform 0.18s ease;
	}

	&[aria-expanded='true'] .sc_chevron {
		transform: rotate(180deg);
	}
`;

export const MenuPanel = styled.div`
	${popoverSurface}

	&[popover] {
		width: 248px;
		padding: 6px;
		border-color: ${({ theme }) => theme.card.border};
		background-color: ${({ theme }) => theme.navbar.menuBg};
		color: ${({ theme }) => theme.text.primary};
	}

	/* right edges lined up, opening downwards (or up if there's no room) */
	@supports (anchor-name: --a) {
		&[popover] {
			position-area: block-end span-inline-start;
			margin-top: 8px;
			position-try-fallbacks: flip-block;
		}
	}

	.sc_who {
		display: flex;
		flex-direction: column;
		padding: 10px 12px 12px;
		margin-bottom: 6px;
		border-bottom: 1px solid ${({ theme }) => theme.card.border};
	}

	.sc_whoName {
		overflow: hidden;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sc_whoEmail {
		overflow: hidden;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		border-radius: 8px;
		font-size: 14.5px;
		text-align: left;
		color: ${({ theme }) => theme.text.primary};

		svg {
			flex-shrink: 0;
			font-size: 17px;
			color: ${({ theme }) => theme.text.secondary};
		}

		&:hover,
		&:focus-visible {
			outline: none;
			background-color: ${({ theme }) => theme.state.hover};
		}

		&[data-tone='danger'],
		&[data-tone='danger'] svg {
			color: ${({ theme }) => theme.status.error};
		}
	}

	.sc_divider {
		height: 1px;
		margin: 6px 0;
		background-color: ${({ theme }) => theme.card.border};
	}
`;
