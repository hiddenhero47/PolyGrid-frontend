import React from 'react';
import PropTypes from 'prop-types';
import { LuCircleAlert } from 'react-icons/lu';
import { FieldWrapper } from './index.style';
import { fieldMessageIds } from '../helpers';

// Label above, control, then the hint — or the error in its place. Every
// form component renders through this, so labels look the same everywhere
// (frontend-plan §3: the label stays visible even when the field is empty).
//
// `as="fieldset"` for groups (radio group): label becomes a <legend>.
function FormField({
	id,
	label,
	hint,
	required = false,
	isError = false,
	errormessage,
	as,
	className,
	children,
}) {
	const { hintId, errorId } = fieldMessageIds(id);
	const showError = Boolean(isError && errormessage);
	const isGroup = as === 'fieldset';

	return (
		<FieldWrapper as={as} className={className}>
			{label &&
				(isGroup ? (
					<legend className="sc_label">
						{label}
						{required && <span className="sc_required">*</span>}
					</legend>
				) : (
					<label htmlFor={id} className="sc_label">
						{label}
						{required && (
							<span className="sc_required" aria-hidden="true">
								*
							</span>
						)}
					</label>
				))}
			{children}
			{showError ? (
				<p id={errorId} className="sc_error">
					<LuCircleAlert aria-hidden="true" />
					{errormessage}
				</p>
			) : (
				hint && (
					<p id={hintId} className="sc_hint">
						{hint}
					</p>
				)
			)}
		</FieldWrapper>
	);
}

FormField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.node,
	hint: PropTypes.node,
	required: PropTypes.bool,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	as: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.node,
};

export default FormField;
