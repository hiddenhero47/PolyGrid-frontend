import styled, { css } from 'styled-components';

// Native checkbox / radio inputs, restyled with appearance: none — the
// browser still handles checking, keyboard and form submission.
const box = css`
	appearance: none;
	-webkit-appearance: none;
	flex-shrink: 0;
	display: inline-grid;
	place-content: center;
	width: 20px;
	height: 20px;
	margin: 1px 0 0;
	border: 1.5px solid ${({ theme }) => theme.form.controlBorder};
	background-color: ${({ theme }) => theme.form.background};
	cursor: pointer;
	transition:
		background-color 0.15s ease,
		border-color 0.15s ease;

	&:hover {
		border-color: ${({ theme }) => theme.form.borderHover};
	}

	&:checked {
		background-color: ${({ theme }) => theme.form.control};
		border-color: ${({ theme }) => theme.form.control};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.form.focus};
		outline-offset: 2px;
	}

	&:disabled {
		cursor: not-allowed;
		background-color: ${({ theme }) => theme.form.disabledBg};
		border-color: ${({ theme }) => theme.form.disabledBorder};
	}

	&[aria-invalid='true'] {
		border-color: ${({ theme }) => theme.form.error};
	}
`;

export const ChoiceRow = styled.label`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	cursor: pointer;
	font-size: 15px;
	line-height: 1.4;
	color: ${({ theme }) => theme.form.text};

	${({ $disabled }) =>
		$disabled &&
		css`
			cursor: not-allowed;
			color: ${({ theme }) => theme.form.disabledText};
		`}

	.sc_text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sc_description {
		font-size: 13px;
		color: ${({ theme }) => theme.form.hint};
	}

	.sc_meta {
		margin-left: auto;
		font-size: 13px;
		color: ${({ theme }) => theme.form.hint};
	}

	.sc_checkbox {
		${box}
		border-radius: 5px;

		/* the tick */
		&::before {
			content: '';
			width: 10px;
			height: 10px;
			clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
			background-color: ${({ theme }) => theme.form.controlMark};
			transform: scale(0);
			transition: transform 0.12s ease;
		}

		&:checked::before {
			transform: scale(1);
		}
	}

	.sc_radio {
		${box}
		border-radius: 50%;

		&::before {
			content: '';
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background-color: ${({ theme }) => theme.form.controlMark};
			transform: scale(0);
			transition: transform 0.12s ease;
		}

		&:checked::before {
			transform: scale(1);
		}
	}
`;

// Radio group "rows" look (Stitch Browse Consultants): each option a row,
// the selected one highlighted.
export const OptionRows = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;

	> label {
		align-items: center;
		padding: 11px 12px;
		border-radius: 8px;
		border: 1px solid transparent;
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: background-color 0.15s ease;

		&:hover {
			background-color: ${({ theme }) => theme.form.optionHover};
		}

		&:has(input:checked) {
			background-color: ${({ theme }) => theme.form.optionSelectedBg};
			color: ${({ theme }) => theme.form.optionSelectedText};
		}

		&:has(input:focus-visible) {
			border-color: ${({ theme }) => theme.form.focus};
		}

		/* radio sits on the right in the rows look */
		.sc_radio {
			order: 2;
			margin-left: auto;
		}

		.sc_radio:focus-visible {
			outline: none;
		}
	}
`;

export const OptionList = styled.div`
	display: flex;
	flex-direction: ${({ $inline }) => ($inline ? 'row' : 'column')};
	flex-wrap: wrap;
	gap: ${({ $inline }) => ($inline ? '10px 24px' : '12px')};

	/* $columns: a grid of N columns from 640px up (long option lists) */
	${({ $columns }) =>
		$columns > 1 &&
		`@media (min-width: 640px) {
			display: grid;
			grid-template-columns: repeat(${$columns}, minmax(0, 1fr));
			gap: 12px 24px;
		}`}
`;

// Toggle: a native checkbox with role="switch".
export const SwitchRow = styled.label`
	display: inline-flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
	font-size: 15px;
	color: ${({ theme }) => theme.form.text};

	${({ $disabled }) =>
		$disabled &&
		css`
			cursor: not-allowed;
			color: ${({ theme }) => theme.form.disabledText};
		`}

	.sc_switch {
		appearance: none;
		-webkit-appearance: none;
		position: relative;
		flex-shrink: 0;
		width: 42px;
		height: 24px;
		margin: 0;
		border-radius: 999px;
		background-color: ${({ theme }) => theme.form.switchTrack};
		cursor: inherit;
		transition: background-color 0.2s ease;

		&::before {
			content: '';
			position: absolute;
			top: 3px;
			left: 3px;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background-color: ${({ theme }) => theme.form.switchThumb};
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
			transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		}

		&:checked {
			background-color: ${({ theme }) => theme.form.control};
		}

		&:checked::before {
			transform: translateX(18px);
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.form.focus};
			outline-offset: 2px;
		}

		&:disabled {
			opacity: ${({ theme }) => theme.state.disabledOpacity};
		}
	}
`;
