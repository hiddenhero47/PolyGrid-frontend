import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { LuCalendar } from 'react-icons/lu';
import FormField from '../field';
import { fieldAria, toDateValue } from '../helpers';
import DatePicker from './date-picker';
import { NativeDateShell } from './index.style';

// One date field, two pickers:
//   - mouse / trackpad → PolyGrid's own calendar (date-picker.jsx)
//   - touch screens    → the native picker (the OS wheel/calendar is the
//                        better experience on a phone)
// Decided once from (pointer: coarse); `native` forces either one.
// Both give back the same 'YYYY-MM-DD' string through an event-like
// onChange, so Formik's handleChange works unchanged. Calendar dates only,
// no time (frontend-plan §3). `min` / `max` block days outside the range —
// e.g. completedAt gets min={values.startedAt}.

const PREFERS_NATIVE =
	typeof window !== 'undefined' &&
	Boolean(window.matchMedia?.('(pointer: coarse)').matches);

function CustomDate({
	value,
	onChange,
	onBlur,
	name,
	id,
	min,
	max,
	placeholder,
	isError = false,
	errormessage,
	label,
	hint,
	required = false,
	disabled = false,
	variant = 'filled',
	native,
	className,
}) {
	const autoId = useId();
	const inputId = id || name || autoId;
	const useNative = native ?? PREFERS_NATIVE;

	const dateValue = toDateValue(value);
	const minValue = toDateValue(min) || undefined;
	const maxValue = toDateValue(max) || undefined;

	// native: clicking anywhere on the field opens the picker, not just the icon
	const openNativePicker = (e) => {
		const input = e.currentTarget.querySelector('input');
		if (disabled || !input) return;
		try {
			input.showPicker?.();
		} catch {
			input.focus();
		}
	};

	return (
		<FormField
			id={inputId}
			label={label}
			hint={hint}
			required={required}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			{useNative ? (
				<NativeDateShell
					onClick={openNativePicker}
					$variant={variant}
					$isError={Boolean(isError)}
					$disabled={disabled}
				>
					<input
						type="date"
						className="sc_control"
						id={inputId}
						name={name}
						value={dateValue}
						min={minValue}
						max={maxValue}
						onChange={onChange}
						onBlur={onBlur}
						disabled={disabled}
						required={required}
						{...fieldAria({ id: inputId, hint, isError, errormessage })}
					/>
					<span className="sc_adornment">
						<LuCalendar aria-hidden="true" />
					</span>
				</NativeDateShell>
			) : (
				<DatePicker
					baseId={inputId}
					value={dateValue}
					onChange={onChange}
					onBlur={onBlur}
					name={name}
					id={id}
					min={minValue}
					max={maxValue}
					placeholder={placeholder}
					isError={isError}
					errormessage={errormessage}
					hint={hint}
					required={required}
					disabled={disabled}
					variant={variant}
				/>
			)}
		</FormField>
	);
}

CustomDate.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	min: PropTypes.string,
	max: PropTypes.string,
	placeholder: PropTypes.string,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	label: PropTypes.node,
	hint: PropTypes.node,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	variant: PropTypes.oneOf(['filled', 'outline']),
	native: PropTypes.bool, // true = always native, false = always ours
	className: PropTypes.string,
};

export default CustomDate;
