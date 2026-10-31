import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { ChoiceRow, OptionList } from './index.style';

const isSame = (a, b) => String(a) === String(b);

// Several checkboxes for one array field (e.g. skills, categories). Value
// is the array of checked values. Formik: value={values.skills}
// setFieldValue={setFieldValue} name="skills".
function CustomCheckboxGroup({
	options = [],
	value = [],
	onChange,
	setFieldValue,
	onBlur,
	name,
	id,
	label,
	hint,
	isError = false,
	errormessage,
	required = false,
	disabled = false,
	inline = false,
	max,
	className,
	columns = 1,
}) {
	const autoId = useId();
	const groupId = id || name || autoId;

	const toggle = (optionValue, checked) => {
		const next = checked
			? [...value, optionValue]
			: value.filter((item) => !isSame(item, optionValue));
		onChange?.(next);
		setFieldValue?.(name || id, next);
	};

	const atMax = max != null && value.length >= max;

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
			<OptionList $inline={inline} $columns={columns}>
				{options.map((option) => {
					const checked = value.some((item) => isSame(item, option.value));
					const isDisabled = disabled || option.disabled || (atMax && !checked);
					return (
						<ChoiceRow key={option.value} $disabled={isDisabled}>
							<input
								type="checkbox"
								className="sc_checkbox"
								name={name}
								value={option.value}
								checked={checked}
								disabled={isDisabled}
								onChange={(e) => toggle(option.value, e.target.checked)}
								onBlur={() =>
									onBlur?.({ type: 'blur', target: { name: name || id } })
								}
								aria-invalid={isError ? true : undefined}
							/>
							<span className="sc_text">
								<span>{option.label}</span>
								{option.description && (
									<span className="sc_description">{option.description}</span>
								)}
							</span>
							{option.meta != null && (
								<span className="sc_meta">{option.meta}</span>
							)}
						</ChoiceRow>
					);
				})}
			</OptionList>
		</FormField>
	);
}

CustomCheckboxGroup.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
				.isRequired,
			label: PropTypes.node.isRequired,
			description: PropTypes.node,
			meta: PropTypes.node, // right-aligned, e.g. a count
			disabled: PropTypes.bool,
		})
	),
	value: PropTypes.array,
	onChange: PropTypes.func,
	setFieldValue: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	inline: PropTypes.bool,
	max: PropTypes.number,
	className: PropTypes.string,
	columns: PropTypes.number, // grid columns from 640px up
};

export default CustomCheckboxGroup;
