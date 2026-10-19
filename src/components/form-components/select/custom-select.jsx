import React, { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuChevronDown, LuCheck } from 'react-icons/lu';
import FormField from '../field';
import { fieldAria, anchorName, placePopover } from '../helpers';
import { SelectTrigger, SelectMenu, OptionImage } from './index.style';

// HM's CustomSelect, rebuilt on the browser's Popover API instead of
// <dialog> + a document mousedown listener in useEffect. A `popover`
// element gets, natively and in Safari too:
//   - closing on a click outside and on Escape (light dismiss)
//   - the top layer (never clipped by overflow, no z-index fights)
//   - focus returning to the trigger when it closes
// so there's no effect to set up or clean up. Open state is only read
// back from the popover's own `toggle` event.
//
// Positioning: CSS anchor positioning (index.style.js) where supported,
// otherwise placed from the trigger's rect in `beforetoggle` — still
// event-driven, no effect.

const NONE = { value: '', label: 'None' };

const isSame = (a, b) => String(a ?? '') === String(b ?? '');

function CustomSelect({
	options = [],
	value,
	placeholder = 'Select…',
	onChange,
	handleChange,
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
	clearable = false,
	paddingX,
}) {
	const autoId = useId();
	const baseId = id || name || autoId;
	const listId = `${baseId}-listbox`;
	const anchor = anchorName('select', baseId);

	const triggerRef = useRef(null);
	const menuRef = useRef(null);
	const [open, setOpen] = useState(false);

	const list = clearable ? [NONE, ...options] : options;
	const selected = options.find((option) => isSame(option.value, value));

	const optionEls = () =>
		Array.from(menuRef.current?.querySelectorAll('[role="option"]') ?? []);

	const focusOption = (index) => {
		const els = optionEls();
		if (!els.length) return;
		const next = (index + els.length) % els.length;
		els[next].focus();
	};

	// ── value out (same shapes as HM, so Formik wiring is unchanged) ──
	const emit = (next) => {
		onChange?.(next);
		handleChange?.(name || id)(next);
	};

	const choose = (option) => {
		emit(option.value);
		menuRef.current?.hidePopover();
		triggerRef.current?.focus();
	};

	// ── popover events ──
	const handleBeforeToggle = (e) => {
		if (e.newState === 'open')
			placePopover(triggerRef.current, menuRef.current);
	};

	const handleToggle = (e) => {
		const isOpen = e.newState === 'open';
		setOpen(isOpen);
		if (isOpen) {
			// start on the chosen option, else the first one
			const index = list.findIndex((option) => isSame(option.value, value));
			focusOption(Math.max(index, 0));
		} else {
			// Formik's handleBlur reads e.target.name — mark touched on close
			onBlur?.({ type: 'blur', target: { name: name || id, id: baseId } });
		}
	};

	// ── keyboard ──
	const handleTriggerKeyDown = (e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			menuRef.current?.showPopover();
		}
	};

	const handleMenuKeyDown = (e) => {
		const els = optionEls();
		const current = els.indexOf(document.activeElement);

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusOption(current + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusOption(current - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusOption(0);
				break;
			case 'End':
				e.preventDefault();
				focusOption(els.length - 1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (current >= 0) choose(list[current]);
				break;
			case 'Tab':
				menuRef.current?.hidePopover();
				break;
			default:
				// type-ahead: jump to the next option starting with that letter
				if (e.key.length === 1 && /\S/.test(e.key)) {
					const letter = e.key.toLowerCase();
					const start = current + 1;
					const order = [...list.slice(start), ...list.slice(0, start)];
					const hit = order.find((option) =>
						String(option.label).toLowerCase().startsWith(letter)
					);
					if (hit) focusOption(list.indexOf(hit));
				}
		}
	};

	return (
		<FormField
			id={baseId}
			label={label}
			hint={hint}
			required={required}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			<SelectTrigger
				ref={triggerRef}
				type="button"
				id={baseId}
				popoverTarget={listId}
				disabled={disabled}
				onKeyDown={handleTriggerKeyDown}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-required={required || undefined}
				style={{ anchorName: anchor }}
				$variant={variant}
				$isError={Boolean(isError)}
				$disabled={disabled}
				$open={open}
				$paddingX={paddingX}
				{...fieldAria({ id: baseId, hint, isError, errormessage })}
			>
				<span className="sc_value">
					{selected ? (
						<>
							{selected.image && (
								<OptionImage>
									<img src={selected.image} alt="" />
								</OptionImage>
							)}
							{selected.label}
						</>
					) : (
						<span className="sc_placeholder">{placeholder}</span>
					)}
				</span>
				<LuChevronDown className="sc_chevron" aria-hidden="true" />
			</SelectTrigger>

			{/* keeps the value in a plain <form> submission too */}
			{name && <input type="hidden" name={name} value={value ?? ''} />}

			<SelectMenu
				ref={menuRef}
				id={listId}
				popover="auto"
				role="listbox"
				aria-label={typeof label === 'string' ? label : placeholder}
				onBeforeToggle={handleBeforeToggle}
				onToggle={handleToggle}
				onKeyDown={handleMenuKeyDown}
				style={{ positionAnchor: anchor }}
			>
				{list.length === 0 && <p className="sc_empty">No options</p>}
				{list.map((option) => {
					const isSelected =
						option === NONE ? !selected : isSame(option.value, value);
					return (
						<div
							key={`${option.value}`}
							role="option"
							tabIndex={-1}
							aria-selected={isSelected}
							className={`sc_option${option === NONE ? ' sc_none' : ''}`}
							onClick={() => choose(option)}
						>
							{option.image && (
								<OptionImage>
									<img src={option.image} alt="" />
								</OptionImage>
							)}
							{option.label}
							{isSelected && option !== NONE && (
								<LuCheck className="sc_check" aria-hidden="true" />
							)}
						</div>
					);
				})}
			</SelectMenu>
		</FormField>
	);
}

CustomSelect.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
				.isRequired,
			label: PropTypes.node.isRequired,
			image: PropTypes.string,
		})
	),
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	placeholder: PropTypes.string,
	onChange: PropTypes.func,
	handleChange: PropTypes.func,
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
	clearable: PropTypes.bool,
	paddingX: PropTypes.string,
};

export default CustomSelect;
