import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuSend } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomSelect,
	CustomTextarea,
	CustomDate,
	CustomRadioGroup,
	CustomCheckbox,
	CustomToggle,
} from '../../../components/form-components';
import { SPECIALIZATION } from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import { LabSection } from './lab-section';
import { CodeBlock } from './index.style';

// Lab-only demo of the whole kit wired to Formik + yup the HM way. Not a
// real backend form — a real one takes its fields and rules from the
// route's validator in polygrid-backend.

const VISIBILITY = [
	{ value: 'public', label: 'Public' },
	{ value: 'clients', label: 'Verified clients only' },
];

const schema = yup.object({
	title: yup.string().trim().required('Title is required').max(80),
	specialization: yup.string().required('Pick a specialization'),
	summary: yup
		.string()
		.trim()
		.min(30, 'Give at least 30 characters')
		.required('Summary is required'),
	startedAt: yup.string().required('Start date is required'),
	completedAt: yup
		.string()
		.test(
			'after-start',
			"Can't be before the start date",
			(value, ctx) =>
				!value || !ctx.parent.startedAt || value >= ctx.parent.startedAt
		),
	visibility: yup.string().required('Choose who can see it'),
	featured: yup.boolean(),
	confirm: yup.boolean().oneOf([true], 'Confirm the details are accurate'),
});

const initialValues = {
	title: '',
	specialization: '',
	summary: '',
	startedAt: '',
	completedAt: '',
	visibility: '',
	featured: false,
	confirm: false,
};

function FormikDemo() {
	const [submitted, setSubmitted] = useState(null);

	const {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		handleSubmit,
		resetForm,
		isSubmitting,
	} = useFormik({
		initialValues,
		validationSchema: schema,
		onSubmit: async (data) => {
			await new Promise((resolve) => setTimeout(resolve, 600));
			setSubmitted(data);
		},
	});

	// HM's pattern: show an error only once the field's been touched
	const err = (field) => (touched[field] && errors[field]) || false;

	return (
		<LabSection
			id="formik"
			title="Live form (Formik + yup)"
			note="Every control wired the HM way — handleChange / handleBlur / handleChange(name)(value). Submit empty to see all the error states at once."
		>
			<form
				noValidate
				onSubmit={handleSubmit}
				className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]"
			>
				<div className="grid gap-6 sm:grid-cols-2">
					<CustomInput
						label="Project title"
						name="title"
						required
						placeholder="e.g. Harbor pier foundations"
						value={values.title}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('title')}
						errormessage={errors.title}
						className="sm:col-span-2"
					/>
					<CustomSelect
						label="Specialization"
						name="specialization"
						required
						placeholder="Choose one"
						options={enumToOptions(SPECIALIZATION, {
							hydraulic_water: 'Hydraulic & water',
						})}
						value={values.specialization}
						handleChange={handleChange}
						onBlur={handleBlur}
						isError={err('specialization')}
						errormessage={errors.specialization}
					/>
					<CustomRadioGroup
						label="Visibility"
						name="visibility"
						required
						inline
						options={VISIBILITY}
						value={values.visibility}
						handleChange={handleChange}
						onBlur={handleBlur}
						isError={err('visibility')}
						errormessage={errors.visibility}
					/>
					<CustomDate
						label="Started"
						name="startedAt"
						required
						value={values.startedAt}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('startedAt')}
						errormessage={errors.startedAt}
					/>
					<CustomDate
						label="Completed"
						name="completedAt"
						min={values.startedAt}
						hint="Leave empty if it's ongoing."
						value={values.completedAt}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('completedAt')}
						errormessage={errors.completedAt}
					/>
					<CustomTextarea
						label="Summary"
						name="summary"
						required
						maxLength={500}
						placeholder="What was built, your role, the outcome…"
						value={values.summary}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('summary')}
						errormessage={errors.summary}
						className="sm:col-span-2"
					/>
					<CustomToggle
						name="featured"
						checked={values.featured}
						onChange={handleChange}
						hint="Pinned to the top of your portfolio."
					>
						Feature this project
					</CustomToggle>
					<CustomCheckbox
						name="confirm"
						checked={values.confirm}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('confirm')}
						errormessage={errors.confirm}
					>
						These details are accurate
					</CustomCheckbox>

					<div className="flex flex-wrap gap-3 sm:col-span-2">
						<AppButton type="submit" icon={<LuSend />} disabled={isSubmitting}>
							{isSubmitting ? 'Saving…' : 'Submit'}
						</AppButton>
						<AppButton
							variant="secondary"
							onClick={() => {
								resetForm();
								setSubmitted(null);
							}}
						>
							Reset
						</AppButton>
					</div>
				</div>

				<div className="flex min-w-0 flex-col gap-3">
					<p className="font-label text-xs font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						{submitted ? 'Submitted values' : 'Live values'}
					</p>
					<CodeBlock>{JSON.stringify(submitted ?? values, null, 2)}</CodeBlock>
				</div>
			</form>
		</LabSection>
	);
}

export default FormikDemo;
