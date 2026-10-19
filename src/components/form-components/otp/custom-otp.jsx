import React, { useId } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FormField from '../field';
import { fieldAria } from '../helpers';

// HM's OTPInput had one <input> per digit, moved focus between them with
// refs, and pushed the value out from a useEffect. This is ONE native input
// drawn as boxes: the boxes are just a picture of its value. So, for free:
//   - paste a whole code, SMS / password-manager autofill
//     (autocomplete="one-time-code"), backspace and arrows all native
//   - no refs, no focus juggling, no effect
// onComplete fires when the last digit lands (e.g. auto-submit 2FA).

const Wrapper = styled.div`
	position: relative;
	width: fit-content;

	/* the real input sits on top of the boxes, invisible but clickable */
	.sc_input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		font-size: 16px; /* stops iOS zooming in on focus */
		cursor: text;

		&:disabled {
			cursor: not-allowed;
		}
	}

	.sc_boxes {
		display: flex;
		gap: ${({ $gap }) => $gap};
		pointer-events: none;
	}

	.sc_box {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: ${({ $size }) => $size};
		height: calc(${({ $size }) => $size} * 1.18);
		border-radius: 10px;
		border: 1px solid ${({ theme }) => theme.form.border};
		background-color: ${({ theme }) => theme.form.background};
		font-family: var(--font-display);
		font-size: calc(${({ $size }) => $size} * 0.55);
		font-weight: 600;
		color: ${({ theme }) => theme.form.text};
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;

		&[data-filled='true'] {
			border-color: ${({ theme }) => theme.form.borderHover};
		}
	}

	/* the box the next digit goes into, while focused */
	.sc_input:focus-visible + .sc_boxes .sc_box[data-active='true'],
	.sc_input:focus + .sc_boxes .sc_box[data-active='true'] {
		border-color: ${({ theme }) => theme.form.focus};
		box-shadow: 0 0 0 1px ${({ theme }) => theme.form.focus};
	}

	/* blinking caret in the active empty box */
	.sc_input:focus
		+ .sc_boxes
		.sc_box[data-active='true'][data-filled='false']::after {
		content: '';
		width: 2px;
		height: 40%;
		border-radius: 2px;
		background-color: ${({ theme }) => theme.form.focus};
		animation: pgCaretBlink 1s steps(1) infinite;
	}

	@keyframes pgCaretBlink {
		50% {
			opacity: 0;
		}
	}

	${({ $isError, theme }) =>
		$isError &&
		`
		.sc_box,
		.sc_box[data-filled='true'] {
			border-color: ${theme.form.error};
		}
	`}

	${({ $disabled, theme }) =>
		$disabled &&
		`
		.sc_box {
			background-color: ${theme.form.disabledBg};
			border-color: ${theme.form.disabledBorder};
			color: ${theme.form.disabledText};
		}
	`}
`;

function CustomOtp({
	length = 6,
	value = '',
	onChange,
	handleChange,
	onComplete,
	onBlur,
	name,
	id,
	label,
	hint,
	isError = false,
	errormessage,
	disabled = false,
	autoFocus = false,
	size = '52px',
	gap = '10px',
	className,
}) {
	const autoId = useId();
	const inputId = id || name || autoId;
	const code = String(value ?? '');

	const handleInput = (e) => {
		const next = e.target.value.replace(/\D/g, '').slice(0, length);
		onChange?.(next);
		handleChange?.(name || id)(next);
		if (next.length === length && code.length !== length) onComplete?.(next);
	};

	// The text is invisible, so keep the caret at the end: typing always
	// fills the next box and Backspace always clears the last one.
	const pinCaret = (e) => {
		const el = e.target;
		const end = el.value.length;
		if (el.selectionStart !== end || el.selectionEnd !== end) {
			el.setSelectionRange(end, end);
		}
	};

	// box i is "active" when it's where the next digit goes (or the last box
	// once full)
	const activeIndex = Math.min(code.length, length - 1);

	return (
		<FormField
			id={inputId}
			label={label}
			hint={hint}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			<Wrapper
				$size={size}
				$gap={gap}
				$isError={Boolean(isError)}
				$disabled={disabled}
			>
				<input
					className="sc_input"
					id={inputId}
					name={name}
					type="text"
					inputMode="numeric"
					autoComplete="one-time-code"
					pattern="[0-9]*"
					maxLength={length}
					value={code}
					onChange={handleInput}
					onSelect={pinCaret}
					onBlur={onBlur}
					disabled={disabled}
					autoFocus={autoFocus}
					aria-label={
						typeof label === 'string' ? undefined : `${length}-digit code`
					}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
				/>
				<div className="sc_boxes" aria-hidden="true">
					{Array.from({ length }, (_, i) => (
						<span
							key={i}
							className="sc_box"
							data-filled={Boolean(code[i])}
							data-active={i === activeIndex}
						>
							{code[i] ?? ''}
						</span>
					))}
				</div>
			</Wrapper>
		</FormField>
	);
}

CustomOtp.propTypes = {
	length: PropTypes.number,
	value: PropTypes.string,
	onChange: PropTypes.func,
	handleChange: PropTypes.func,
	onComplete: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	disabled: PropTypes.bool,
	autoFocus: PropTypes.bool,
	size: PropTypes.string,
	gap: PropTypes.string,
	className: PropTypes.string,
};

export default CustomOtp;
