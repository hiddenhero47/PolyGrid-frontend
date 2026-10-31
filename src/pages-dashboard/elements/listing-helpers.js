import {
	countryName,
	formatDate,
	formatMoney,
} from '../../utilities/basic-functions';

// Shared wording for tender projects and SiteForce openings.

// { country, state?, city? } → "Ikeja, LA, Nigeria"
export const placeText = (area) =>
	area
		? [area.city, area.state, countryName(area.country)]
				.filter(Boolean)
				.join(', ')
		: '';

export const budgetText = ({ budgetMin, budgetMax, currency } = {}) => {
	if (budgetMin != null && budgetMax != null)
		return `${formatMoney(budgetMin, currency)} – ${formatMoney(budgetMax, currency)}`;
	if (budgetMin != null) return `From ${formatMoney(budgetMin, currency)}`;
	if (budgetMax != null) return `Up to ${formatMoney(budgetMax, currency)}`;
	return 'Budget open';
};

export const isPast = (date) => Boolean(date) && new Date(date) <= new Date();

export const closesText = (date, verb = 'Bids close') =>
	date ? `${isPast(date) ? 'Closed' : verb} ${formatDate(date)}` : '';

export const idOf = (value) => String(value?._id || value?.id || value || '');

const PAY_SUFFIX = { hourly: '/ hour', daily: '/ day', fixed: 'fixed' };

// 40, 'daily' → "$40 / day"
export const payText = ({ payRate, payType, currency } = {}) =>
	payRate != null
		? `${formatMoney(payRate, currency)} ${PAY_SUFFIX[payType] || ''}`.trim()
		: '';
