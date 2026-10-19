import styled from 'styled-components';
import { fieldShell } from '../field/index.style';
import { popoverSurface } from '../select/index.style';

// Native date input (touch devices, or native={true})
export const NativeDateShell = styled.div`
	${fieldShell}
	cursor: pointer;

	.sc_control {
		cursor: pointer;
		font-variant-numeric: tabular-nums;
	}

	/* use our icon; keep the native indicator clickable but invisible */
	.sc_control::-webkit-calendar-picker-indicator {
		opacity: 0;
		cursor: pointer;
	}
`;

// Trigger for our own calendar — looks like every other field.
export const DateTrigger = styled.button`
	${fieldShell}
	justify-content: space-between;
	text-align: left;
	cursor: pointer;
	font-variant-numeric: tabular-nums;

	&:focus-visible {
		outline: none;
		border-color: ${({ theme, $isError }) =>
			$isError ? theme.form.error : theme.form.focus};
		box-shadow: 0 0 0 1px
			${({ theme, $isError }) => ($isError ? theme.form.error : theme.form.focus)};
	}

	.sc_placeholder {
		color: ${({ theme }) => theme.form.placeholder};
	}

	.sc_adornment {
		color: ${({ theme, $open }) =>
			$open ? theme.form.focus : theme.form.placeholder};
	}
`;

export const CalendarPopover = styled.div`
	${popoverSurface}

	&[popover] {
		width: 312px;
		padding: 14px;
		/* never taller than the room it's given — scrolls inside instead */
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	@supports (anchor-name: --a) {
		&[popover] {
			position-area: block-end span-inline-end;
			margin-top: 6px;
			/* open on whichever side (above / below) has more room … */
			position-try-order: most-height;
			position-try-fallbacks:
				flip-block,
				flip-inline,
				flip-block flip-inline;
			/* … and shrink to fit that side if it's still too short */
			max-height: calc(100% - 6px);
		}
	}

	/* header: month title + arrows */
	.sc_header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
	}

	.sc_month {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.form.text};
	}

	.sc_year {
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_nav {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		font-size: 18px;
		color: ${({ theme }) => theme.form.label};
		transition: background-color 0.15s ease;

		&:hover {
			background-color: ${({ theme }) => theme.form.optionHover};
			color: ${({ theme }) => theme.form.text};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.form.focus};
			outline-offset: 1px;
		}

		&:disabled {
			opacity: 0.35;
			pointer-events: none;
		}
	}

	/* the grid */
	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 2px;
		table-layout: fixed;
	}

	th {
		padding-bottom: 6px;
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.form.hint};
	}

	.sc_day {
		position: relative;
		width: 100%;
		height: 36px;
		border-radius: 8px;
		font-size: 14px;
		font-variant-numeric: tabular-nums;
		color: ${({ theme }) => theme.form.text};
		transition:
			background-color 0.12s ease,
			color 0.12s ease;

		&:hover {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.form.focus};
			outline-offset: 1px;
		}

		/* days from the previous / next month */
		&[data-outside='true'] {
			color: ${({ theme }) => theme.form.placeholder};
		}

		/* today: a small dot under the number */
		&[data-today='true']::after {
			content: '';
			position: absolute;
			left: 50%;
			bottom: 5px;
			width: 4px;
			height: 4px;
			margin-left: -2px;
			border-radius: 50%;
			background-color: ${({ theme }) => theme.text.highlight};
		}

		&[aria-pressed='true'] {
			background-color: ${({ theme }) => theme.form.control};
			color: ${({ theme }) => theme.form.controlMark};
			font-weight: 700;

			&::after {
				background-color: ${({ theme }) => theme.form.controlMark};
			}
		}

		/* outside min / max */
		&[aria-disabled='true'] {
			color: ${({ theme }) => theme.form.disabledText};
			text-decoration: line-through;
			text-decoration-color: ${({ theme }) => theme.form.disabledText};
			cursor: not-allowed;

			&:hover {
				background-color: transparent;
			}
		}
	}

	/* footer: Today / Clear */
	.sc_footer {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid ${({ theme }) => theme.form.menuBorder};
	}

	.sc_action {
		padding: 6px 8px;
		border-radius: 6px;
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.link};

		&:hover {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.form.focus};
		}

		&:disabled {
			color: ${({ theme }) => theme.form.disabledText};
			pointer-events: none;
		}
	}
`;
