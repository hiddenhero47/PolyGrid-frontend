import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { ChoiceRow, OptionList, OptionRows } from './index.style';

const isSame = (a, b) => String(a ?? '') === String(b ?? '');

// Native radios in a <fieldset> — arrow keys move between options for
// free. variant="rows" is the Stitch filter look (highlighted rows).
// Formik: value={values.x} handleChange={handleChange} name="x", same
// handleChange(name)(value) shape as HM's select.
function CustomRadioGroup({
	options = [],
	value,
	onChange,
	handleChange,
	onBlur,
	name,
	id,
	label,
	hint,
	isError = false,
	errormessage,
	required = false,
	disabled = false,
	variant = 'list',
	inline = false,
	className,
}) {
	const autoId = useId();
	const groupId = id || name || autoId;
	const groupName = name || groupId;

	const emit = (next) => {
		onChange?.(next);
		handleChange?.(name || id)(next);
	};

	const rows = options.map((option) => {
		const isDisabled = disabled || option.disabled;
		return (
			<ChoiceRow key={option.value} $disabled={isDisabled}>
				<input
					type="radio"
					className="sc_radio"
					name={groupName}
					value={option.value}
					checked={isSame(option.value, value)}
					disabled={isDisabled}
					required={required}
					onChange={() => emit(option.value)}
					onBlur={() => onBlur?.({ type: 'blur', target: { name: groupName } })}
					aria-invalid={isError ? true : undefined}
				/>
				<span className="sc_text">
					<span>{option.label}</span>
					{option.description && (
						<span className="sc_description">{option.description}</span>
					)}
				</span>
			</ChoiceRow>
		);
	});

	return (
		<FormField
			id={groupId}
			as="fieldset"
			label={label}
			hint={hint}
			required={required}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			{variant === 'rows' ? (
				<OptionRows>{rows}</OptionRows>
			) : (
				<OptionList $inline={inline}>{rows}</OptionList>
			)}
		</FormField>
	);
}

CustomRadioGroup.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
				.isRequired,
			label: PropTypes.node.isRequired,
			description: PropTypes.node,
			disabled: PropTypes.bool,
		})
	),
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func,
	handleChange: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	variant: PropTypes.oneOf(['list', 'rows']),
	inline: PropTypes.bool,
	className: PropTypes.string,
};

export default CustomRadioGroup;
