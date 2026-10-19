import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { InputShell } from './index.style';

// HM's CustomInput props, plus label / hint / required / variant and
// optional icons either side. Works straight with Formik:
//   onChange={handleChange} onBlur={handleBlur}
//   isError={touched.x && errors.x} errormessage={errors.x}
function CustomInput({
	value,
	placeholder,
	onChange,
	onBlur,
	isError = false,
	errormessage,
	type = 'text',
	name,
	id,
	className,
	disabled = false,
	required = false,
	label,
	hint,
	variant = 'filled',
	paddingX,
	paddingY,
	autoComplete = 'off',
	onKeyDown,
	startIcon,
	endIcon,
	...rest
}) {
	const autoId = useId();
	const inputId = id || name || autoId;

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
				{startIcon && <span className="sc_adornment">{startIcon}</span>}
				<input
					className="sc_control"
					type={type}
					name={name}
					id={inputId}
					value={value ?? ''}
					onChange={onChange}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					autoComplete={autoComplete}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
					{...rest}
				/>
				{endIcon && <span className="sc_adornment">{endIcon}</span>}
			</InputShell>
		</FormField>
	);
}

CustomInput.propTypes = {
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	placeholder: PropTypes.string,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	type: PropTypes.string,
	name: PropTypes.string,
	id: PropTypes.string,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	required: PropTypes.bool,
	label: PropTypes.node,
	hint: PropTypes.node,
	variant: PropTypes.oneOf(['filled', 'outline']),
	paddingX: PropTypes.string,
	paddingY: PropTypes.string,
	autoComplete: PropTypes.string,
	onKeyDown: PropTypes.func,
	startIcon: PropTypes.node,
	endIcon: PropTypes.node,
};

export default CustomInput;
