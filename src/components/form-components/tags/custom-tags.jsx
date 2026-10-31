import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { TagsShell } from './index.style';

// Free-text chips (portfolio tags, mentorship areas). Type and press
// Enter or comma to add; Backspace in an empty box removes the last one;
// pasting "a, b, c" adds all three. Value: string[]. Duplicates (any
// case) are ignored. Formik: setFieldValue={setFieldValue} name="tags".
function CustomTags({
	value = [],
	onChange,
	setFieldValue,
	onBlur,
	name,
	id,
	label,
	hint,
	placeholder = 'Type and press Enter',
	max,
	maxLength = 40,
	required = false,
	isError = false,
	errormessage,
	disabled = false,
	variant = 'filled',
	className,
}) {
	const autoId = useId();
	const inputId = id || autoId;
	const [text, setText] = useState('');
	const full = max ? value.length >= max : false;

	const commit = (next) => {
		onChange?.(next);
		setFieldValue?.(name || inputId, next);
	};

	const add = (raw) => {
		const incoming = raw
			.split(',')
			.map((t) => t.trim().slice(0, maxLength))
			.filter(Boolean);
		if (!incoming.length) return;
		const next = [...value];
		incoming.forEach((tag) => {
			const exists = next.some((t) => t.toLowerCase() === tag.toLowerCase());
			if (!exists && (!max || next.length < max)) next.push(tag);
		});
		commit(next);
		setText('');
	};

	const remove = (tag) => commit(value.filter((t) => t !== tag));

	return (
		<FormField
			id={inputId}
			label={label}
			hint={hint || (max ? `${value.length} of ${max}` : undefined)}
			required={required}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			<TagsShell
				$isError={Boolean(isError)}
				$disabled={disabled}
				$variant={variant}
			>
				{value.map((tag) => (
					<span key={tag} className="sc_tag">
						{tag}
						<button
							type="button"
							onClick={() => remove(tag)}
							disabled={disabled}
							aria-label={`Remove ${tag}`}
						>
							<LuX aria-hidden="true" />
						</button>
					</span>
				))}
				<input
					id={inputId}
					name={name}
					value={text}
					disabled={disabled || full}
					placeholder={full ? '' : value.length ? '' : placeholder}
					maxLength={maxLength * 4}
					onChange={(e) => {
						if (e.target.value.includes(',')) add(e.target.value);
						else setText(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							add(text);
						} else if (e.key === 'Backspace' && !text && value.length) {
							remove(value[value.length - 1]);
						}
					}}
					onBlur={(e) => {
						if (text) add(text);
						onBlur?.({ ...e, target: { ...e.target, name } });
					}}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
				/>
			</TagsShell>
		</FormField>
	);
}

CustomTags.propTypes = {
	value: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func,
	setFieldValue: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	placeholder: PropTypes.string,
	max: PropTypes.number,
	maxLength: PropTypes.number,
	required: PropTypes.bool,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	disabled: PropTypes.bool,
	variant: PropTypes.oneOf(['filled', 'outline']),
	className: PropTypes.string,
};

export default CustomTags;
