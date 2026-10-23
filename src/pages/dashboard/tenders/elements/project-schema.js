import * as yup from 'yup';
import dayjs from 'dayjs';
import {
	TENDER_CATEGORY,
	CONTRACTOR_SPECIALTY_LABELS,
	PLATFORM_CURRENCY,
} from '../../../../utilities/app-const';
import { enumToOptions } from '../../../../utilities/basic-functions';

// A tender project's form: options, rules (mirroring polygrid-backend
// tenderProjectValidator.ts), initial values and the request body.

export const CATEGORY_OPTIONS = enumToOptions(
	TENDER_CATEGORY,
	CONTRACTOR_SPECIALTY_LABELS
);

export const tomorrow = () => dayjs().add(1, 'day').format('YYYY-MM-DD');

// optional money field: '' (left empty) is null, not NaN
export const optionalNumber = yup
	.number()
	.transform((value, original) => (original === '' ? null : value))
	.typeError('Enter a number')
	.min(0, 'Can’t be negative')
	.nullable();

// mirrors polygrid-backend tenderProjectValidator.ts
export const projectSchema = yup.object({
	title: yup.string().trim().max(150).required('Give the project a title'),
	description: yup.string().trim().max(5000).required('Describe the project'),
	category: yup.string().required('Choose a category'),
	budgetMin: optionalNumber,
	budgetMax: optionalNumber.test(
		'range',
		'Must be at least the minimum',
		function (max) {
			const { budgetMin } = this.parent;
			return max == null || budgetMin == null || max >= budgetMin;
		}
	),
	country: yup.string().required('Where is the site?'),
	state: yup.string(),
	bidDeadline: yup
		.string()
		.required('When do bids close?')
		.test('future', 'Pick a date after today', (v) => !v || v >= tomorrow()),
});

export const projectValues = (project) => ({
	title: project?.title || '',
	description: project?.description || '',
	category: project?.category || '',
	budgetMin: project?.budgetMin ?? '',
	budgetMax: project?.budgetMax ?? '',
	country: project?.location?.country || '',
	state: project?.location?.state || '',
	bidDeadline: project?.bidDeadline
		? dayjs(project.bidDeadline).format('YYYY-MM-DD')
		: '',
	files: [],
});

const num = (v) => (v === '' || v == null ? undefined : Number(v));

// Form values → the backend body. Bids close at the end of the chosen day.
export const projectPayload = (values) => ({
	title: values.title.trim(),
	description: values.description.trim(),
	category: values.category,
	budgetMin: num(values.budgetMin),
	budgetMax: num(values.budgetMax),
	currency: PLATFORM_CURRENCY,
	location: {
		country: values.country,
		...(values.state && { state: values.state }),
	},
	bidDeadline: dayjs(values.bidDeadline).endOf('day').toISOString(),
});
