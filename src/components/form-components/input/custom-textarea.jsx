import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { TextareaShell } from './index.style';

// HM's CustomTextarea. `maxLength` also shows a live character count.
function CustomTextarea({
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
	minHeight,
	maxHeight,
	maxLength,
	paddingX,
	autoComplete = 'off',
	...rest
}) {
	const autoId = useId();
	const inputId = id || name || autoId;
	const length = String(value ?? '').length;

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
			<TextareaShell
				$variant={variant}
				$isError={Boolean(isError)}
				$disabled={disabled}
				$minHeight={minHeight}
				$maxHeight={maxHeight}
				$paddingX={paddingX}
			>
				<textarea
					className="sc_control"
					name={name}
					id={inputId}
					value={value ?? ''}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					maxLength={maxLength}
					autoComplete={autoComplete}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
					{...rest}
				/>
				{maxLength && (
					<span className="sc_count" aria-live="polite">
						{length} / {maxLength}
					</span>
				)}
			</TextareaShell>
		</FormField>
	);
}

CustomTextarea.propTypes = {
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
	minHeight: PropTypes.string,
	maxHeight: PropTypes.string,
	maxLength: PropTypes.number,
	paddingX: PropTypes.string,
	autoComplete: PropTypes.string,
};

export default CustomTextarea;
