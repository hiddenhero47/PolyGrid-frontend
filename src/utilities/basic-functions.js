import { CONTRACTOR_SPECIALTY_LABELS, LABOR_SKILL_LABELS } from './app-const';

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

// worker skill / SiteForce job category value → label (same enum)
export const skillLabel = (value) =>
	LABOR_SKILL_LABELS[value] || humanize(value);

// A person's legal name, from the backend's `fullName` — an object
// { firstName, lastName } since the identity change (still read as a
// string for anything cached from before it). Only the person themselves
// and staff reviewing identity see this; everywhere else shows
// displayName().
export const legalName = (user) => {
	const name = user?.fullName;
	if (typeof name === 'string') return name;
	return [name?.firstName, name?.lastName].filter(Boolean).join(' ');
};

// The name PolyGrid shows for a person: their `userName` (a display name,
// not unique), else their legal name. Populated users (job parties,
// reviewers, contacts, message participants…) carry only `userName`.
export const displayName = (user) =>
	(user && typeof user === 'object' && (user.userName || legalName(user))) || '';
