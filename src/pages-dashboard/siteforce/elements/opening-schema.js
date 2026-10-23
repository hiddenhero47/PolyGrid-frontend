import * as yup from 'yup';
import dayjs from 'dayjs';
import {
	EMPLOYMENT_TYPE,
	EMPLOYMENT_TYPE_LABELS,
	LABOR_SKILL,
	LABOR_SKILL_LABELS,
	PAY_TYPE,
	PLATFORM_CURRENCY,
} from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';

// A SiteForce job opening's form: options, rules (mirroring
// polygrid-backend jobOpeningValidator.ts), values and request body.

export const SKILL_OPTIONS = enumToOptions(LABOR_SKILL, LABOR_SKILL_LABELS);
export const PAY_TYPE_OPTIONS = [
	{ value: PAY_TYPE.DAILY, label: 'Per day' },
	{ value: PAY_TYPE.HOURLY, label: 'Per hour' },
	{ value: PAY_TYPE.FIXED, label: 'Fixed for the job' },
];
export const EMPLOYMENT_OPTIONS = enumToOptions(
	EMPLOYMENT_TYPE,
	EMPLOYMENT_TYPE_LABELS
);

export const tomorrow = () => dayjs().add(1, 'day').format('YYYY-MM-DD');

export const openingSchema = yup.object({
	title: yup.string().trim().max(150).required('Give the job a title'),
	description: yup.string().trim().max(5000).required('Describe the work'),
	category: yup.string().required('Choose a trade'),
	workersNeeded: yup
		.number()
		.typeError('Enter a number')
		.integer('Whole people')
		.min(1, 'At least 1')
		.required('How many people?'),
	payRate: yup
		.number()
		.typeError('Enter the pay')
		.moreThan(0, 'Enter the pay')
		.required('Enter the pay'),
	payType: yup.string().required(),
	employmentType: yup.string().required(),
	country: yup.string().required('Which country?'),
	state: yup.string(),
	city: yup.string().trim().max(100),
	coordinates: yup.object({ lat: yup.number(), lng: yup.number() }).nullable(),
	address: yup.string().trim().max(300),
	googleMapsUrl: yup
		.string()
		.trim()
		.url('Paste a full link (https://…)')
		.max(500),
	contactInfo: yup.string().trim().max(300),
	applicationDeadline: yup
		.string()
		.test('future', 'Pick a date after today', (v) => !v || v >= tomorrow()),
});

export const openingValues = (opening) => ({
	title: opening?.title || '',
	description: opening?.description || '',
	category: opening?.category || '',
	workersNeeded: opening?.workersNeeded ?? 1,
	payRate: opening?.payRate ?? '',
	payType: opening?.payType || PAY_TYPE.DAILY,
	employmentType: opening?.employmentType || EMPLOYMENT_TYPE.SHORT_TERM,
	country: opening?.generalArea?.country || '',
	state: opening?.generalArea?.state || '',
	city: opening?.generalArea?.city || '',
	coordinates: opening?.coordinates?.lat != null ? opening.coordinates : null,
	address: opening?.address || '',
	googleMapsUrl: opening?.googleMapsUrl || '',
	contactInfo: opening?.contactInfo || '',
	applicationDeadline: opening?.applicationDeadline
		? dayjs(opening.applicationDeadline).format('YYYY-MM-DD')
		: '',
	files: [],
});

const optional = (text) => (text && text.trim() ? text.trim() : undefined);

// Values → the backend body. Applications close at the end of the day.
export const openingPayload = (values) => ({
	title: values.title.trim(),
	description: values.description.trim(),
	category: values.category,
	workersNeeded: Number(values.workersNeeded),
	payRate: Number(values.payRate),
	payType: values.payType,
	currency: PLATFORM_CURRENCY,
	employmentType: values.employmentType,
	generalArea: {
		country: values.country,
		...(values.state && { state: values.state }),
		...(optional(values.city) && { city: optional(values.city) }),
	},
	...(values.coordinates && { coordinates: values.coordinates }),
	address: optional(values.address),
	googleMapsUrl: optional(values.googleMapsUrl),
	contactInfo: optional(values.contactInfo),
	...(values.applicationDeadline && {
		applicationDeadline: dayjs(values.applicationDeadline)
			.endOf('day')
			.toISOString(),
	}),
});
