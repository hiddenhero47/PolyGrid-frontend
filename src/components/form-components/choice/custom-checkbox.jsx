import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { ChoiceRow } from './index.style';

// One checkbox with its own label (the label is the clickable row).
// Formik: checked={values.x} onChange={handleChange} — Formik reads
// e.target.checked for checkboxes. Or onChange={(e) => setFieldValue(...)}.
function CustomCheckbox({
	checked = false,
	onChange,
	onBlur,
	name,
	id,
	value,
	children,
	description,
	isError = false,
	errormessage,
	hint,
	disabled = false,
	required = false,
	className,
}) {
	const autoId = useId();
	const inputId = id || autoId;

	return (
		<FormField
			id={inputId}
			hint={hint}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			<ChoiceRow $disabled={disabled}>
				<input
					type="checkbox"
					className="sc_checkbox"
					id={inputId}
					name={name}
					value={value}
					checked={Boolean(checked)}
					onChange={onChange}
					onBlur={onBlur}
					disabled={disabled}
					required={required}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
				/>
				<span className="sc_text">
					<span>{children}</span>
					{description && <span className="sc_description">{description}</span>}
				</span>
			</ChoiceRow>
		</FormField>
	);
}

CustomCheckbox.propTypes = {
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	value: PropTypes.string,
	children: PropTypes.node,
	description: PropTypes.node,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	hint: PropTypes.node,
	disabled: PropTypes.bool,
	required: PropTypes.bool,
	className: PropTypes.string,
};

export default CustomCheckbox;
