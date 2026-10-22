import * as yup from 'yup';
import { SERVICE_PRICING_MODE } from '../../utilities/app-const';

// Business profile forms (frontend-plan §B.3a). Mirrors polygrid-backend
// validators/consultancyProfile/consultancyProfileValidator.ts and the
// Mongoose sub-schemas in models/consultancyProfileModel.ts — plus a few
// friendlier limits of our own (lengths) the backend doesn't enforce.

// '' from an empty number input → null, so "optional number" works
const optionalNumber = (label) =>
	yup
		.number()
		.transform((value, original) =>
			original === '' || original == null ? null : value
		)
		.typeError(`${label} must be a number`)
		.nullable();

// The Details form of any business profile, shaped by its editor config
// (pages/dashboard/profiles/editor/config.js): the name field, an
// optional disciplines list, optional years of experience.
export const profileDetailsSchema = (config) =>
	yup.object({
		[config.nameField]: yup
			.string()
			.trim()
			.max(120, 'Keep it under 120 characters')
			.required(`Add a ${config.nameLabel.toLowerCase()}`),
		country: yup.string().required('Choose your country'),
		city: yup.string().trim().max(80),
		...(config.years && {
			yearsOfExperience: optionalNumber('Years of experience')
				.integer('Whole years only')
				.min(0, 'Can’t be negative')
				.max(70, 'That seems a bit high'),
		}),
		...(config.disciplines && {
			[config.disciplines.field]: yup
				.array()
				.of(yup.string())
				.min(
					1,
					`Pick at least one ${config.disciplines.label.toLowerCase().replace(/s$/, '')}`
				),
		}),
		[config.bioField || 'bio']: yup
			.string()
			.trim()
			.max(2000, 'Keep it under 2,000 characters'),
	});

export const serviceSchema = yup.object({
	title: yup.string().trim().max(120).required('Name the service'),
	description: yup.string().trim().max(600, 'Keep it under 600 characters'),
	pricingMode: yup
		.string()
		.oneOf(Object.values(SERVICE_PRICING_MODE))
		.required('Choose how it’s priced'),
	price: yup
		.number()
		.typeError('Enter a price in USD')
		.min(0, 'Can’t be negative')
		.required('Enter a price in USD'),
	durationMinutes: optionalNumber('Duration')
		.integer('Whole minutes only')
		.min(1, 'At least 1 minute'),
});

export const mentorshipSchema = yup.object({
	isMentor: yup.boolean(),
	bio: yup.string().trim().max(1000, 'Keep it under 1,000 characters'),
	areas: yup.array().of(yup.string()).max(10, 'Up to 10 areas'),
	ratePerSession: optionalNumber('Rate').min(0, 'Can’t be negative'),
});

export const linkSchema = yup.object({
	label: yup.string().trim().max(40).required('Add a label, e.g. Website'),
	url: yup
		.string()
		.trim()
		.matches(/^https?:\/\/\S+\.\S+/i, 'Must start with http:// or https://')
		.required('Add the link'),
});

export const portfolioItemSchema = yup.object({
	title: yup.string().trim().max(120).required('Give the project a title'),
	description: yup.string().trim().max(1500, 'Keep it under 1,500 characters'),
	tags: yup.array().of(yup.string()).max(8, 'Up to 8 tags'),
	startedAt: yup.string(),
	completedAt: yup
		.string()
		.test(
			'after-start',
			'Must be on or after the start date',
			function (value) {
				const { startedAt } = this.parent;
				return !value || !startedAt || value >= startedAt;
			}
		),
	media: yup.array().max(6, 'Up to 6 images per project'),
});
