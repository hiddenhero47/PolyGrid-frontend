import styled, { css } from 'styled-components';
import { fieldShell } from '../field/index.style';

export const SelectTrigger = styled.button`
	${fieldShell}
	justify-content: space-between;
	text-align: left;
	cursor: pointer;

	/* the trigger is itself the focusable element */
	&:focus-visible {
		outline: none;
		border-color: ${({ theme, $isError }) =>
			$isError ? theme.form.error : theme.form.focus};
		box-shadow: 0 0 0 1px
			${({ theme, $isError }) => ($isError ? theme.form.error : theme.form.focus)};
	}

	.sc_value {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.sc_placeholder {
		color: ${({ theme }) => theme.form.placeholder};
	}

	.sc_chevron {
		flex-shrink: 0;
		font-size: 18px;
		color: ${({ theme }) => theme.form.placeholder};
		transition: transform 0.2s ease;
		transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
	}
`;

// The dropdown — a native popover (top layer, click-outside and Escape
// handled by the browser). Positioned under its trigger with CSS anchor
// positioning; the component sets top/left itself where that's missing.
// Shared surface for every popover in the form kit (select menu, date
// calendar): a native popover in the top layer, with an enter animation.
export const popoverSurface = css`
	&[popover] {
		margin: 0;
		inset: auto;
		border-radius: 10px;
		border: 1px solid ${({ theme }) => theme.form.menuBorder};
		background-color: ${({ theme }) => theme.form.menuBg};
		color: ${({ theme }) => theme.form.text};
		box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.35);

		/* open animation (enter only — closing is instant) */
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease,
			overlay 0.15s allow-discrete,
			display 0.15s allow-discrete;
	}

	&:popover-open {
		opacity: 1;
		transform: translateY(0);

		@starting-style {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
`;

export const SelectMenu = styled.div`
	${popoverSurface}

	&[popover] {
		padding: 6px;
		min-width: 180px;
		max-height: min(320px, 45vh);
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	@supports (anchor-name: --a) {
		&[popover] {
			position-area: block-end span-inline-end;
			width: anchor-size(width);
			margin-top: 6px;
			position-try-order: most-height;
			position-try-fallbacks: flip-block;
			max-height: min(320px, calc(100% - 6px));
		}
	}

	.sc_option {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		border-radius: 7px;
		font-size: 15px;
		cursor: pointer;
		outline: none;
		color: ${({ theme }) => theme.form.text};

		&:hover,
		&:focus-visible,
		&:focus {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&[aria-selected='true'] {
			background-color: ${({ theme }) => theme.form.optionSelectedBg};
			color: ${({ theme }) => theme.form.optionSelectedText};
			font-weight: 600;
		}

		.sc_check {
			margin-left: auto;
			font-size: 16px;
		}
	}

	.sc_none {
		color: ${({ theme }) => theme.form.placeholder};
	}

	.sc_empty {
		padding: 12px;
		font-size: 14px;
		color: ${({ theme }) => theme.form.hint};
	}
`;

export const OptionImage = styled.span`
	position: relative;
	flex-shrink: 0;
	width: 22px;
	height: 22px;
	overflow: hidden;
	border-radius: 5px;

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;
