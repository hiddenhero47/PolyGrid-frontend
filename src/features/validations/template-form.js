import * as yup from 'yup';

// Verification forms are catalog data (VerificationTemplate.fields), so
// their yup schema is built at runtime — a copy of polygrid-backend
// src/validators/verification/templateFormSchema.ts, so the form rejects
// exactly what the backend would.

export const TEMPLATE_FIELD_TYPE = {
	STRING: 'string',
	NUMBER: 'number',
	BOOLEAN: 'boolean',
	DATE: 'date',
	SELECT: 'select',
	EMAIL: 'email',
	PHONE: 'phone',
};

const applyRequired = (schema, field) =>
	field.required
		? schema.required(`${field.label} is required`)
		: schema
				.transform((value) => (value === '' ? undefined : value))
				.notRequired();

const fieldSchema = (field) => {
	switch (field.type) {
		case TEMPLATE_FIELD_TYPE.NUMBER: {
			let schema = yup
				.number()
				.transform((value, original) => (original === '' ? undefined : value))
				.typeError(`${field.label} must be a number`);
			if (field.min !== undefined) schema = schema.min(field.min);
			if (field.max !== undefined) schema = schema.max(field.max);
			return applyRequired(schema, field);
		}
		case TEMPLATE_FIELD_TYPE.BOOLEAN:
			// a required checkbox means "must be ticked"
			return field.required
				? yup.boolean().oneOf([true], `${field.label} is required`)
				: yup.boolean();
		case TEMPLATE_FIELD_TYPE.DATE:
			return applyRequired(yup.string(), field);
		case TEMPLATE_FIELD_TYPE.SELECT:
			return applyRequired(
				yup
					.string()
					.trim()
					.oneOf(
						[...(field.options ?? []), ''],
						`${field.label} is not a valid option`
					),
				field
			);
		case TEMPLATE_FIELD_TYPE.EMAIL:
			return applyRequired(
				yup.string().trim().email(`${field.label} must be a valid email`),
				field
			);
		default: {
			let schema = yup.string().trim();
			if (field.minLength !== undefined) schema = schema.min(field.minLength);
			if (field.maxLength !== undefined) schema = schema.max(field.maxLength);
			if (field.pattern) {
				schema = schema.matches(
					new RegExp(field.pattern),
					`${field.label} format looks wrong`
				);
			}
			return applyRequired(schema, field);
		}
	}
};

export const buildTemplateSchema = (fields = []) =>
	yup.object(
		Object.fromEntries(fields.map((field) => [field.key, fieldSchema(field)]))
	);

export const templateInitialValues = (fields = []) =>
	Object.fromEntries(
		fields.map((field) => [
			field.key,
			field.type === TEMPLATE_FIELD_TYPE.BOOLEAN ? false : '',
		])
	);

// Values ready for the backend: trimmed, empty optionals dropped,
// numbers as numbers.
export const templateFormBody = (fields = [], values = {}) =>
	Object.fromEntries(
		fields
			.map((field) => {
				let value = values[field.key];
				if (typeof value === 'string') value = value.trim();
				if (value === '' || value == null) return null;
				if (field.type === TEMPLATE_FIELD_TYPE.NUMBER) value = Number(value);
				return [field.key, value];
			})
			.filter(Boolean)
	);

// acceptedFormats ['pdf', 'jpg', 'png'] → '.pdf,.jpg,.jpeg,.png' for <input accept>
export const acceptFromFormats = (formats = []) =>
	formats
		.flatMap((format) => {
			const ext = String(format).toLowerCase().replace(/^\./, '');
			return ext === 'jpg' || ext === 'jpeg' ? ['.jpg', '.jpeg'] : [`.${ext}`];
		})
		.join(',');
