import React, { useId } from 'react';
import PropTypes from 'prop-types';
import FormField from '../field';
import { SwitchRow } from './index.style';

// On/off switch — a native checkbox with role="switch", so Space toggles
// it and screen readers announce "on/off". Formik: checked={values.x}
// onChange={handleChange} (reads e.target.checked).
function CustomToggle({
	checked = false,
	onChange,
	onBlur,
	name,
	id,
	children,
	hint,
	disabled = false,
	className,
}) {
	const autoId = useId();
	const inputId = id || autoId;

	return (
		<FormField id={inputId} hint={hint} className={className}>
			<SwitchRow $disabled={disabled}>
				<input
					type="checkbox"
					role="switch"
					className="sc_switch"
					id={inputId}
					name={name}
					checked={Boolean(checked)}
					onChange={onChange}
					onBlur={onBlur}
					disabled={disabled}
					aria-checked={Boolean(checked)}
					aria-describedby={hint ? `${inputId}-hint` : undefined}
				/>
				{children}
			</SwitchRow>
		</FormField>
	);
}

CustomToggle.propTypes = {
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	children: PropTypes.node,
	hint: PropTypes.node,
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

export default CustomToggle;
