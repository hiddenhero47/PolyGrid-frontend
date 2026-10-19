import React, { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuChevronDown, LuSearch } from 'react-icons/lu';
import {
	getCountries,
	getCountryCallingCode,
	parsePhoneNumberFromString,
} from 'libphonenumber-js';
import FormField from '../field';
import { fieldAria, anchorName, placePopover } from '../helpers';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import { PhoneShell, CountryMenu } from './index.style';

// HM's PhoneInput, rebuilt without its two useEffects. Value is the
// backend's shape (userModel.ts): { number: '+2348031234567', country: 'NG' }.
//   - countries: GET /api/reference/countries (the list the backend
//     validates against); dial codes + validity: libphonenumber-js
//   - while typing, `number` is +<dial><digits>; once the digits make a
//     valid number it's normalized to E.164 (e.g. a leading trunk 0 dropped)
//   - the country menu is a native popover with a search box (same
//     pattern as CustomSelect)
// Formik: value={values.phoneNumber} setFieldValue={setFieldValue}
// name="phoneNumber" onBlur={handleBlur}; validate with isValidPhone().

const SUPPORTED = new Set(getCountries());

const flag = (iso) =>
	String.fromCodePoint(
		...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0))
	);

const dialCode = (iso) => {
	try {
		return getCountryCallingCode(iso);
	} catch {
		return '';
	}
};

// the national digits to show for a stored value
const nationalDigits = (value) => {
	if (!value?.number) return '';
	const parsed = parsePhoneNumberFromString(value.number);
	if (parsed?.nationalNumber) return parsed.nationalNumber;
	const dial = dialCode(value.country || '');
	return value.number.replace(/\D/g, '').replace(new RegExp(`^${dial}`), '');
};

function CustomPhone({
	value,
	onChange,
	setFieldValue,
	onBlur,
	name,
	id,
	label,
	hint,
	placeholder = 'Phone number',
	required = false,
	disabled = false,
	isError = false,
	errormessage,
	variant = 'filled',
	defaultCountry = 'NG',
	className,
}) {
	const autoId = useId();
	const inputId = id || name || autoId;
	const menuId = `${inputId}-countries`;
	const anchor = anchorName('phone', inputId);

	const shellRef = useRef(null);
	const menuRef = useRef(null);
	const searchRef = useRef(null);
	const [query, setQuery] = useState('');

	const { data: countries = [] } = ReferenceServices.getCountries();
	const country = (value?.country || defaultCountry).toUpperCase();
	const dial = dialCode(country);

	// The typed digits live here so a leading 0 doesn't vanish mid-typing.
	// If the value is replaced from outside (form reset, loaded profile),
	// re-derive — React's "adjust state while rendering" pattern, no effect.
	const external = value?.number ?? '';
	const [draft, setDraft] = useState(() => ({
		digits: nationalDigits(value),
		source: external,
	}));
	if (draft.source !== external) {
		setDraft({ digits: nationalDigits(value), source: external });
	}

	const emit = (next) => {
		onChange?.(next);
		setFieldValue?.(name || id, next);
	};

	const compose = (digits, iso) => {
		if (!digits) return '';
		const parsed = parsePhoneNumberFromString(digits, iso);
		return parsed?.isValid() ? parsed.number : `+${dialCode(iso)}${digits}`;
	};

	const handleInput = (e) => {
		const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
		const number = compose(digits, country);
		setDraft({ digits, source: number });
		emit({ number, country });
	};

	const chooseCountry = (iso) => {
		const number = compose(draft.digits, iso);
		setDraft({ digits: draft.digits, source: number });
		emit({ number, country: iso });
		menuRef.current?.hidePopover();
		shellRef.current?.querySelector('input')?.focus();
	};

	const options = countries
		.filter((c) => SUPPORTED.has(c.isoCode))
		.map((c) => ({ iso: c.isoCode, name: c.name, dial: dialCode(c.isoCode) }));
	const q = query.trim().toLowerCase().replace(/^\+/, '');
	const filtered = q
		? options.filter(
				(o) =>
					o.name.toLowerCase().includes(q) ||
					o.dial.startsWith(q) ||
					o.iso.toLowerCase() === q
			)
		: options;

	const handleBeforeToggle = (e) => {
		if (e.newState !== 'open') return;
		setQuery('');
		placePopover(shellRef.current, menuRef.current, {
			matchWidth: false,
			needs: 360,
		});
	};

	const handleToggle = (e) => {
		if (e.newState === 'open') searchRef.current?.focus();
	};

	// ↓ from the search box moves into the list; ↑/↓ inside it
	const handleMenuKeyDown = (e) => {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		const els = Array.from(menuRef.current.querySelectorAll('[role="option"]'));
		if (!els.length) return;
		e.preventDefault();
		const i = els.indexOf(document.activeElement);
		const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
		if (next < 0) searchRef.current?.focus();
		else els[Math.min(next, els.length - 1)].focus();
	};

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
			<PhoneShell
				ref={shellRef}
				style={{ anchorName: anchor }}
				$variant={variant}
				$isError={Boolean(isError)}
				$disabled={disabled}
			>
				<button
					type="button"
					className="sc_country"
					popoverTarget={menuId}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-label={`Country code: ${country} +${dial}. Change`}
				>
					<span className="sc_flag" aria-hidden="true">
						{flag(country)}
					</span>
					+{dial}
					<LuChevronDown className="sc_chevron" aria-hidden="true" />
				</button>
				<span className="sc_divider" aria-hidden="true" />
				<input
					className="sc_control"
					type="tel"
					inputMode="tel"
					autoComplete="tel-national"
					id={inputId}
					name={name}
					value={draft.digits}
					onChange={handleInput}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					{...fieldAria({ id: inputId, hint, isError, errormessage })}
				/>
			</PhoneShell>

			<CountryMenu
				ref={menuRef}
				id={menuId}
				popover="auto"
				aria-label="Choose a country"
				onBeforeToggle={handleBeforeToggle}
				onToggle={handleToggle}
				onKeyDown={handleMenuKeyDown}
				style={{ positionAnchor: anchor }}
			>
				<label className="sc_search">
					<LuSearch aria-hidden="true" />
					<input
						ref={searchRef}
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && filtered[0]) {
								e.preventDefault();
								chooseCountry(filtered[0].iso);
							}
						}}
						placeholder="Search country or code"
						aria-label="Search countries"
					/>
				</label>
				<div className="sc_list" role="listbox" aria-label="Countries">
					{filtered.length === 0 && (
						<p className="sc_empty">
							{options.length ? 'No matching country' : 'Loading countries…'}
						</p>
					)}
					{filtered.map((o) => (
						<button
							key={o.iso}
							type="button"
							role="option"
							aria-selected={o.iso === country}
							className="sc_option"
							onClick={() => chooseCountry(o.iso)}
						>
							<span aria-hidden="true">{flag(o.iso)}</span>
							<span className="sc_name">{o.name}</span>
							<span className="sc_dial">+{o.dial}</span>
						</button>
					))}
				</div>
			</CountryMenu>
		</FormField>
	);
}

CustomPhone.propTypes = {
	value: PropTypes.shape({
		number: PropTypes.string,
		country: PropTypes.string,
	}),
	onChange: PropTypes.func,
	setFieldValue: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	variant: PropTypes.oneOf(['filled', 'outline']),
	defaultCountry: PropTypes.string,
	className: PropTypes.string,
};

export default CustomPhone;
