import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuSend } from 'react-icons/lu';
import { AppButton } from '../../../../components/button';
import {
	CustomInput,
	CustomSelect,
	CustomDate,
	CustomCheckbox,
	CustomFile,
} from '../../../../components/form-components';
import {
	TEMPLATE_FIELD_TYPE,
	buildTemplateSchema,
	templateInitialValues,
	templateFormBody,
	acceptFromFormats,
} from '../../../../features/validations/template-form';

const INPUT_TYPES = {
	[TEMPLATE_FIELD_TYPE.EMAIL]: 'email',
	[TEMPLATE_FIELD_TYPE.PHONE]: 'tel',
	[TEMPLATE_FIELD_TYPE.NUMBER]: 'number',
};

// Renders a VerificationTemplate exactly as the catalog defines it — the
// fields and documents are data, never hardcoded (frontend-plan §B.4).
// onSubmit gets { form, documents: { [type]: File } }.
function TemplateForm({ template, onSubmit, isPending }) {
	const fields = template.fields || [];
	const documents = template.documents || [];

	const form = useFormik({
		initialValues: {
			...templateInitialValues(fields),
			documents: Object.fromEntries(documents.map((doc) => [doc.type, null])),
		},
		validationSchema: buildTemplateSchema(fields).shape({
			documents: yup.object(
				Object.fromEntries(
					documents.map((doc) => [
						doc.type,
						doc.required
							? yup.mixed().required(`Attach your ${doc.label.toLowerCase()}`)
							: yup.mixed().nullable(),
					])
				)
			),
		}),
		onSubmit: (values) =>
			onSubmit({
				form: templateFormBody(fields, values),
				documents: values.documents,
			}),
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	const renderField = (field) => {
		const common = {
			name: field.key,
			label: field.label,
			required: field.required,
			hint: field.helpText,
			isError: err(field.key),
			errormessage: form.errors[field.key],
		};
		switch (field.type) {
			case TEMPLATE_FIELD_TYPE.SELECT:
				return (
					<CustomSelect
						key={field.key}
						{...common}
						options={(field.options || []).map((o) => ({ value: o, label: o }))}
						value={form.values[field.key]}
						handleChange={(name) => (value) => form.setFieldValue(name, value)}
						onBlur={form.handleBlur}
					/>
				);
			case TEMPLATE_FIELD_TYPE.DATE:
				return (
					<CustomDate
						key={field.key}
						{...common}
						value={form.values[field.key]}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
					/>
				);
			case TEMPLATE_FIELD_TYPE.BOOLEAN:
				return (
					<div key={field.key} className="sm:col-span-2">
						<CustomCheckbox
							name={field.key}
							checked={form.values[field.key]}
							onChange={form.handleChange}
							hint={err(field.key) ? form.errors[field.key] : field.helpText}
						>
							{field.label}
						</CustomCheckbox>
					</div>
				);
			default:
				return (
					<CustomInput
						key={field.key}
						{...common}
						type={INPUT_TYPES[field.type] || 'text'}
						value={form.values[field.key]}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						maxLength={field.maxLength}
					/>
				);
		}
	};

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit}
			className="flex flex-col gap-6"
		>
			{fields.length > 0 && (
				<fieldset className="grid gap-5 sm:grid-cols-2">
					<legend className="font-label mb-4 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
						Details
					</legend>
					{fields.map(renderField)}
				</fieldset>
			)}

			{documents.length > 0 && (
				<fieldset className="grid gap-5 sm:grid-cols-2">
					<legend className="font-label mb-4 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
						Documents
					</legend>
					{documents.map((doc) => (
						<CustomFile
							key={doc.type}
							name={doc.type}
							label={doc.label}
							required={doc.required}
							accept={acceptFromFormats(doc.acceptedFormats)}
							acceptLabel={(doc.acceptedFormats || [])
								.map((f) => f.toUpperCase())
								.join(', ')}
							hint="Only PolyGrid’s review team can see this file."
							value={form.values.documents[doc.type]}
							onChange={(file) => {
								form.setFieldValue(`documents.${doc.type}`, file);
								form.setFieldTouched(`documents.${doc.type}`, true, false);
							}}
							isError={
								(form.touched.documents?.[doc.type] || form.submitCount > 0) &&
								Boolean(form.errors.documents?.[doc.type])
							}
							errormessage={form.errors.documents?.[doc.type]}
						/>
					))}
				</fieldset>
			)}

			<div>
				<AppButton type="submit" icon={<LuSend />} disabled={isPending}>
					{isPending ? 'Submitting…' : 'Submit for review'}
				</AppButton>
			</div>
		</form>
	);
}

TemplateForm.propTypes = {
	template: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default TemplateForm;
