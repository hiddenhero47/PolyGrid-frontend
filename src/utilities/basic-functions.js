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
