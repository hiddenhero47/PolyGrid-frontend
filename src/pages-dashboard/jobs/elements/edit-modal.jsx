import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
} from '../../../components/form-components';
import { JOB_TYPE, JOB_TYPE_LABELS } from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import StageEditor from './stage-editor';
import { stagesTotal } from './job-helpers';

const TYPE_OPTIONS = enumToOptions(JOB_TYPE, JOB_TYPE_LABELS);

const schema = yup.object({
	jobTitle: yup.string().trim().max(120).required('Give the job a title'),
	jobDescription: yup.string().trim().max(3000).required('Describe the work'),
	totalAmount: yup
		.number()
		.typeError('Enter the total in USD')
		.min(0, 'Can’t be negative')
		.required('Enter the total in USD'),
	stages: yup
		.array()
		.test(
			'sum',
			'Stage shares can’t add up to more than 100%',
			(s = []) => stagesTotal(s) <= 100
		)
		.test('each', 'Every stage needs a share above 0%', (s = []) =>
			s.every((stage) => Number(stage.payment) > 0)
		),
});

const fromJob = (job) => ({
	jobTitle: job?.jobTitle || '',
	jobDescription: job?.jobDescription || '',
	jobType: job?.jobType || JOB_TYPE.OTHER,
	totalAmount: String(job?.totalAmount ?? ''),
	stages: (job?.stages || []).map((s) => ({
		payment: String(s.payment),
		details: s.details || [],
	})),
});

// The creator's edit, while the other side hasn't confirmed yet
// (PATCH /api/jobs/:id).
function EditJobModal({ refName, job, onSubmit, isPending }) {
	const form = useFormik({
		initialValues: fromJob(job),
		enableReinitialize: true,
		validationSchema: schema,
		onSubmit: (values) =>
			onSubmit({
				jobTitle: values.jobTitle.trim(),
				jobDescription: values.jobDescription.trim(),
				jobType: values.jobType,
				totalAmount: Number(values.totalAmount),
				stages: values.stages.map((s) => ({
					payment: Number(s.payment),
					details: s.details || [],
				})),
			}),
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<Modal.Center
			refName={refName}
			width="760px"
			queryWidth="100%"
			onOpen={() => form.resetForm({ values: fromJob(job) })}
		>
			<Modal.Card
				eyebrow="Edit job"
				title="Change the terms"
				subtitle="Only possible until the other side confirms."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="edit-job-form" disabled={isPending}>
							{isPending ? 'Saving…' : 'Save changes'}
						</AppButton>
					</>
				}
			>
				<form
					id="edit-job-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="flex flex-col gap-5"
				>
					<CustomInput
						label="Job title"
						name="jobTitle"
						required
						value={form.values.jobTitle}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('jobTitle')}
						errormessage={form.errors.jobTitle}
					/>
					<CustomTextarea
						label="Description"
						name="jobDescription"
						required
						minHeight="120px"
						maxLength={3000}
						value={form.values.jobDescription}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('jobDescription')}
						errormessage={form.errors.jobDescription}
					/>
					<div className="grid gap-5 sm:grid-cols-2">
						<CustomInput
							label="Total (USD)"
							name="totalAmount"
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							required
							value={form.values.totalAmount}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('totalAmount')}
							errormessage={form.errors.totalAmount}
						/>
						<CustomSelect
							label="Type"
							name="jobType"
							options={TYPE_OPTIONS}
							value={form.values.jobType}
							onChange={(value) => form.setFieldValue('jobType', value)}
						/>
					</div>
					<StageEditor
						value={form.values.stages}
						onChange={(stages) => form.setFieldValue('stages', stages)}
						totalAmount={form.values.totalAmount}
						currency={job?.currency}
						error={form.submitCount > 0 && form.errors.stages}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

EditJobModal.propTypes = {
	refName: PropTypes.object.isRequired,
	job: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default EditJobModal;
