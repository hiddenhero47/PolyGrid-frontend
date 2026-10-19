import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { InputShell } from './index.style';

// HM's CustomPassword: a show/hide toggle on the right.
function CustomPassword({
	value,
	placeholder,
	onChange,
	onBlur,
	isError = false,
	errormessage,
	name,
	id,
	className,
	disabled = false,
	required = false,
	label,
	hint,
	variant = 'filled',
	autoComplete = 'new-password',
	paddingX,
	paddingY,
	...rest
}) {
	const autoId = useId();
	const inputId = id || name || autoId;
	const [visible, setVisible] = useState(false);

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
			<InputShell
				$variant={variant}
				$isError={Boolean(isError)}
				$disabled={disabled}
				$paddingX={paddingX}
				$paddingY={paddingY}
			>
				<input
					className="sc_control"
					type={visible ? 'text' : 'password'}
					name={name}
					id={inputId}
					value={value ?? ''}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					autoComplete={autoComplete}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
					{...rest}
				/>
				<button
					type="button"
					className="sc_reveal"
					onClick={() => setVisible((v) => !v)}
					disabled={disabled}
					aria-label={visible ? 'Hide password' : 'Show password'}
					aria-pressed={visible}
				>
					{visible ? <LuEye /> : <LuEyeOff />}
				</button>
			</InputShell>
		</FormField>
	);
}

CustomPassword.propTypes = {
	value: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	name: PropTypes.string,
	id: PropTypes.string,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	required: PropTypes.bool,
	label: PropTypes.node,
	hint: PropTypes.node,
	variant: PropTypes.oneOf(['filled', 'outline']),
	autoComplete: PropTypes.string,
	paddingX: PropTypes.string,
	paddingY: PropTypes.string,
};

export default CustomPassword;
