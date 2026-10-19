import styled, { css } from 'styled-components';

// The look every text-like control shares (input, password, textarea,
// select trigger, date) — frontend-plan §3's five states:
//   Normal / Filled  — same container, only the value differs
//   Active           — coral ring (:focus-within), never the browser default
//   Error            — error border, combined with Normal or Filled
//   Disabled         — lower contrast, not focusable
// $variant: 'filled' (default, Stitch look) | 'outline'
export const fieldShell = css`
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	min-height: 46px;
	padding-inline: ${({ $paddingX }) => $paddingX || '14px'};
	padding-block: ${({ $paddingY }) => $paddingY || '0'};
	border-radius: 8px;
	border: 1px solid ${({ theme }) => theme.form.border};
	background-color: ${({ theme, $variant }) =>
		$variant === 'outline' ? 'transparent' : theme.form.background};
	color: ${({ theme }) => theme.form.text};
	font-size: 15px;
	transition:
		border-color 0.15s ease,
		box-shadow 0.15s ease,
		background-color 0.15s ease;

	&:hover {
		border-color: ${({ theme }) => theme.form.borderHover};
	}

	&:focus-within {
		border-color: ${({ theme }) => theme.form.focus};
		box-shadow: 0 0 0 1px ${({ theme }) => theme.form.focus};
	}

	${({ $isError }) =>
		$isError &&
		css`
			&,
			&:hover {
				border-color: ${({ theme }) => theme.form.error};
			}

			&:focus-within {
				border-color: ${({ theme }) => theme.form.error};
				box-shadow: 0 0 0 1px ${({ theme }) => theme.form.error};
			}
		`}

	${({ $disabled }) =>
		$disabled &&
		css`
			&,
			&:hover {
				cursor: not-allowed;
				border-color: ${({ theme }) => theme.form.disabledBorder};
				background-color: ${({ theme }) => theme.form.disabledBg};
				color: ${({ theme }) => theme.form.disabledText};
			}
		`}

	/* the native element inside the shell */
	.sc_control {
		flex: 1;
		min-width: 0;
		height: 100%;
		min-height: inherit;
		background: transparent;
		border: 0;
		outline: none;
		color: inherit;
		font: inherit;

		&::placeholder {
			color: ${({ theme }) => theme.form.placeholder};
			opacity: 1;
		}

		&:disabled {
			cursor: not-allowed;
		}
	}

	.sc_adornment {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		font-size: 18px;
		color: ${({ theme }) => theme.form.placeholder};
	}
`;

export const FieldWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;

	.sc_label {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.form.label};
	}

	/* a <legend> isn't a flex item, so the wrapper's gap skips it */
	legend.sc_label {
		margin-bottom: 12px;
	}

	.sc_required {
		margin-left: 4px;
		color: ${({ theme }) => theme.form.error};
	}

	.sc_hint {
		font-size: 13px;
		line-height: 1.4;
		color: ${({ theme }) => theme.form.hint};
	}

	.sc_error {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		line-height: 1.4;
		color: ${({ theme }) => theme.form.error};
	}
`;
