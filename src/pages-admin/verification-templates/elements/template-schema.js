import * as yup from 'yup';
import { TEMPLATE_FIELD_TYPE } from '../../../features/validations/template-form';

// The verification template form — mirrors polygrid-backend
// verificationTemplateValidator.ts. A field's / document's key is what
// the submitted value is stored under, so keys are made from the label
// until edited by hand, and must be unique.

export const FIELD_TYPE_OPTIONS = [
	{ value: TEMPLATE_FIELD_TYPE.STRING, label: 'Text' },
	{ value: TEMPLATE_FIELD_TYPE.NUMBER, label: 'Number' },
	{ value: TEMPLATE_FIELD_TYPE.DATE, label: 'Date' },
	{ value: TEMPLATE_FIELD_TYPE.SELECT, label: 'Choice (select)' },
	{ value: TEMPLATE_FIELD_TYPE.BOOLEAN, label: 'Checkbox (yes / no)' },
	{ value: TEMPLATE_FIELD_TYPE.EMAIL, label: 'Email' },
	{ value: TEMPLATE_FIELD_TYPE.PHONE, label: 'Phone' },
];
export const FIELD_TYPE_LABELS = Object.fromEntries(
	FIELD_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

// models/verificationTemplateModel.ts TEMPLATE_DOCUMENT_FORMAT
export const DOCUMENT_FORMAT_OPTIONS = ['pdf', 'jpg', 'png', 'webp'].map(
	(v) => ({
		value: v,
		label: v.toUpperCase(),
	})
);

// "Business registration no." → "business_registration_no"
export const toKey = (label = '') =>
	label
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.slice(0, 60);

export const blankField = () => ({
	key: '',
	label: '',
	type: TEMPLATE_FIELD_TYPE.STRING,
	required: true,
	helpText: '',
	options: [],
	pattern: '',
	minLength: '',
	maxLength: '',
	min: '',
	max: '',
	keyEdited: false,
});

export const blankDocument = () => ({
	type: '',
	label: '',
	required: true,
	acceptedFormats: ['pdf', 'jpg', 'png'],
	keyEdited: false,
});

const num = yup
	.number()
	.transform((v, o) => (o === '' || o == null ? undefined : v))
	.typeError('Enter a number');

const uniqueBy = (prop, message) =>
	function test(list = []) {
		const seen = new Set();
		for (let i = 0; i < list.length; i += 1) {
			const key = list[i]?.[prop];
			if (key && seen.has(key))
				return this.createError({ path: `${this.path}.${i}.${prop}`, message });
			seen.add(key);
		}
		return true;
	};

const KEY_RULE = /^[A-Za-z][A-Za-z0-9_]*$/;

export const templateSchema = yup.object({
	profileType: yup.string().required('Choose who this is for'),
	country: yup.string().required('Choose a country'),
	state: yup.string(),
	name: yup.string().trim().max(120).required('Name this template'),
	fields: yup
		.array(
			yup.object({
				label: yup.string().trim().required('Add a label'),
				key: yup
					.string()
					.trim()
					.required('Add a key')
					.matches(
						KEY_RULE,
						'Letters, numbers and _ only, starting with a letter'
					),
				type: yup.string().required(),
				options: yup.array().when('type', {
					is: TEMPLATE_FIELD_TYPE.SELECT,
					then: (s) => s.min(2, 'Give at least two choices'),
				}),
				minLength: num.min(0),
				maxLength: num.min(1),
				min: num,
				max: num,
				pattern: yup.string().test('regex', 'Not a valid pattern', (v) => {
					if (!v) return true;
					try {
						new RegExp(v);
						return true;
					} catch {
						return false;
					}
				}),
			})
		)
		.min(1, 'Add at least one field')
		.test(
			'unique',
			'Each key must be unique',
			uniqueBy('key', 'Another field already uses this key')
		),
	documents: yup
		.array(
			yup.object({
				label: yup.string().trim().required('Add a label'),
				type: yup
					.string()
					.trim()
					.required('Add a key')
					.matches(
						KEY_RULE,
						'Letters, numbers and _ only, starting with a letter'
					),
				acceptedFormats: yup.array().min(1, 'Pick at least one format'),
			})
		)
		.test(
			'unique',
			'Each key must be unique',
			uniqueBy('type', 'Another document already uses this key')
		),
});

// A template (or nothing) → form values. Starting from an existing one is
// how a "new version" begins.
export const templateValues = (template) => ({
	profileType: template?.profileType || '',
	country: template?.country || '',
	state: template?.state || '',
	name: template?.name || '',
	fields: (template?.fields || []).map((f) => ({
		...blankField(),
		...f,
		helpText: f.helpText || '',
		pattern: f.pattern || '',
		options: f.options || [],
		minLength: f.minLength ?? '',
		maxLength: f.maxLength ?? '',
		min: f.min ?? '',
		max: f.max ?? '',
		keyEdited: true,
	})),
	documents: (template?.documents || []).map((d) => ({
		...blankDocument(),
		...d,
		keyEdited: true,
	})),
});

const n = (v) => (v === '' || v == null ? undefined : Number(v));

// Form values → the POST body: only the settings that apply to each type.
export const templatePayload = (values) => ({
	profileType: values.profileType,
	country: values.country,
	...(values.state && { state: values.state }),
	name: values.name.trim(),
	fields: values.fields.map((f) => ({
		key: f.key.trim(),
		label: f.label.trim(),
		type: f.type,
		required: Boolean(f.required),
		...(f.helpText.trim() && { helpText: f.helpText.trim() }),
		...(f.type === TEMPLATE_FIELD_TYPE.SELECT && { options: f.options }),
		...(f.type === TEMPLATE_FIELD_TYPE.STRING && {
			...(f.pattern && { pattern: f.pattern }),
			...(n(f.minLength) != null && { minLength: n(f.minLength) }),
			...(n(f.maxLength) != null && { maxLength: n(f.maxLength) }),
		}),
		...(f.type === TEMPLATE_FIELD_TYPE.NUMBER && {
			...(n(f.min) != null && { min: n(f.min) }),
			...(n(f.max) != null && { max: n(f.max) }),
		}),
	})),
	documents: values.documents.map((d) => ({
		type: d.type.trim(),
		label: d.label.trim(),
		required: Boolean(d.required),
		acceptedFormats: d.acceptedFormats,
	})),
});
