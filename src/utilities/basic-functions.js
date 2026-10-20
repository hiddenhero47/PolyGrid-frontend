import { CONTRACTOR_SPECIALTY_LABELS } from './app-const';

export const getFromLocalStorage = (value) => {
	if (!value || typeof window === 'undefined') {
		return '';
	}
	return localStorage.getItem(value);
};

// 'hydraulic_water' → 'Hydraulic Water'
export const humanize = (value = '') =>
	String(value)
		.split(/[_\s-]+/)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');

// A backend enum object ({ STRUCTURAL: 'structural', … }) → select/radio
// options, so lists always come from the enum, never typed by hand
// (frontend-plan §3). `labels` overrides individual labels.
export const enumToOptions = (enumObject, labels = {}) =>
	Object.values(enumObject).map((value) => ({
		value,
		label: labels[value] ?? humanize(value),
	}));

// 'NG' → 'Nigeria' (falls back to the code)
export const countryName = (code) => {
	if (!code) return '';
	try {
		return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
	} catch {
		return code;
	}
};

// 1500, 'USD' → '$1,500'
export const formatMoney = (amount, currency = 'USD') => {
	try {
		return new Intl.NumberFormat('en', {
			style: 'currency',
			currency,
			maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
		}).format(amount);
	} catch {
		return `${currency} ${amount}`;
	}
};

// 'Ada Okafor' → 'AO', 'Form & Frame' → 'FF' (skips symbols)
export const initials = (name = '') =>
	name
		.trim()
		.split(/\s+/)
		.filter((word) => /^[\p{L}\p{N}]/u.test(word))
		.slice(0, 2)
		.map((word) => word[0])
		.join('')
		.toUpperCase();

// ISO string / Date → '19 Oct 2026' ('' for nothing)
export const formatDate = (value, withTime = false) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		...(withTime && { hour: '2-digit', minute: '2-digit' }),
	});
};

// contractor specialty / tender category value → label (same enum)
export const specialtyLabel = (value) =>
	CONTRACTOR_SPECIALTY_LABELS[value] || humanize(value);
