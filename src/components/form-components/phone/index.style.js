import styled from 'styled-components';
import { fieldShell } from '../field/index.style';
import { popoverSurface } from '../select/index.style';

export const PhoneShell = styled.div`
	${fieldShell}
	padding-left: 6px;

	.sc_country {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: 6px;
		height: 34px;
		padding: 0 8px;
		border-radius: 6px;
		font-variant-numeric: tabular-nums;
		color: ${({ theme }) => theme.form.text};
		transition: background-color 0.15s ease;

		&:hover {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.form.focus};
		}

		&:disabled {
			pointer-events: none;
		}
	}

	.sc_flag {
		font-size: 18px;
		line-height: 1;
	}

	.sc_chevron {
		font-size: 14px;
		color: ${({ theme }) => theme.form.placeholder};
	}

	.sc_divider {
		align-self: stretch;
		width: 1px;
		margin-block: 10px;
		background-color: ${({ theme }) => theme.form.border};
	}
`;

export const CountryMenu = styled.div`
	${popoverSurface}

	&[popover] {
		width: 320px;
		max-width: calc(100vw - 16px);
		padding: 8px;
	}

	@supports (anchor-name: --a) {
		&[popover] {
			position-area: block-end span-inline-end;
			margin-top: 6px;
			position-try-order: most-height;
			position-try-fallbacks: flip-block;
			max-height: min(360px, calc(100% - 6px));
		}
	}

	&[popover] {
		display: none;
		flex-direction: column;
	}

	&:popover-open {
		display: flex;
	}

	.sc_search {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		padding: 0 10px;
		height: 40px;
		border-radius: 8px;
		border: 1px solid ${({ theme }) => theme.form.border};
		background-color: ${({ theme }) => theme.form.background};
		color: ${({ theme }) => theme.form.placeholder};

		&:focus-within {
			border-color: ${({ theme }) => theme.form.focus};
		}

		input {
			flex: 1;
			min-width: 0;
			background: transparent;
			border: 0;
			outline: none;
			font-size: 14px;
			color: ${({ theme }) => theme.form.text};

			&::placeholder {
				color: ${({ theme }) => theme.form.placeholder};
			}
		}
	}

	.sc_list {
		flex: 1;
		min-height: 0;
		max-height: 300px;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.sc_option {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 9px 10px;

		/* a gap so a hovered row never touches the selected one */
		& + .sc_option {
			margin-top: 2px;
		}
		border-radius: 7px;
		font-size: 14px;
		text-align: left;
		color: ${({ theme }) => theme.form.text};
		outline: none;

		&:hover,
		&:focus-visible {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&[aria-selected='true'] {
			background-color: ${({ theme }) => theme.form.optionSelectedBg};
			color: ${({ theme }) => theme.form.optionSelectedText};
			font-weight: 600;
		}

		.sc_name {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.sc_dial {
			font-variant-numeric: tabular-nums;
			color: ${({ theme }) => theme.form.hint};
		}
	}

	.sc_empty {
		padding: 12px 10px;
		font-size: 14px;
		color: ${({ theme }) => theme.form.hint};
	}
`;
