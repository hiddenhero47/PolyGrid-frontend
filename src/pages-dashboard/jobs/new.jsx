import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuArrowLeft, LuSend, LuUserSearch } from 'react-icons/lu';
import JobServices from '../../features/services/custom-hooks/jobs';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomRadioGroup,
} from '../../components/form-components';
import {
	JOB_TYPE,
	JOB_TYPE_LABELS,
	PLATFORM_CURRENCY,
} from '../../utilities/app-const';
import { enumToOptions } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import StageEditor from './elements/stage-editor';
import { stagesTotal } from './elements/job-helpers';

const OBJECT_ID = /^[a-f\d]{24}$/i;
const TYPE_OPTIONS = enumToOptions(JOB_TYPE, JOB_TYPE_LABELS);

const schema = yup.object({
	myRole: yup.string().oneOf(['client', 'provider']).required(),
	jobTitle: yup.string().trim().max(120).required('Give the job a title'),
	jobDescription: yup.string().trim().max(3000).required('Describe the work'),
	jobType: yup.string().required(),
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

// frontend-plan §B.6 "Create a job" — the generic "hire someone directly"
// record, started from a profile page:
//   /dashboard/jobs/new?with=<userId>&name=<their name>&type=<jobType>
// The other person confirms it before it becomes active.
function NewJob() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const { user } = useSelector((state) => state.auth);
	const create = JobServices.create();

	const counterpartyId = OBJECT_ID.test(params.get('with') || '')
		? params.get('with')
		: '';
	const counterpartyName = params.get('name') || 'this person';
	const startType = Object.values(JOB_TYPE).includes(params.get('type'))
		? params.get('type')
		: JOB_TYPE.OTHER;

	const form = useFormik({
		initialValues: {
			myRole: params.get('role') === 'provider' ? 'provider' : 'client',
			jobTitle: '',
			jobDescription: '',
			jobType: startType,
			totalAmount: '',
			stages: [],
		},
		validationSchema: schema,
		onSubmit: (values) => {
			const body = {
				counterpartyUserId: counterpartyId,
				myRole: values.myRole,
				jobTitle: values.jobTitle.trim(),
				jobDescription: values.jobDescription.trim(),
				jobType: values.jobType,
				totalAmount: Number(values.totalAmount),
				currency: PLATFORM_CURRENCY,
			};
			if (values.stages.length) {
				body.stages = values.stages.map((s) => ({
					payment: Number(s.payment),
					details: s.details || [],
				}));
			}
			create.mutate(body, {
				onSuccess: (job) => {
					toast.success(`Sent — ${counterpartyName} needs to confirm it`);
					navigate(`${ROUTES.DASHBOARD_JOBS}/${job._id}`, { replace: true });
				},
			});
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	const back = (
		<Link
			to={ROUTES.DASHBOARD_JOBS}
			className="font-label mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
		>
			<LuArrowLeft aria-hidden="true" /> All jobs
		</Link>
	);

	if (!counterpartyId || counterpartyId === user?.id) {
		return (
			<>
				{back}
				<EmptyState
					icon={<LuUserSearch />}
					title="Start from someone’s profile"
					text="Open the consultant, contractor or worker you want to work with and use “Request a job” there."
					actions={
						<AppButton to={ROUTES.ENGINEERING}>Browse consultants</AppButton>
					}
				/>
			</>
		);
	}

	return (
		<>
			{back}
			<PageHeader
				eyebrow="New job"
				title={`Work with ${counterpartyName}`}
				subtitle="Set out the work, the total and how it’s paid. They confirm it, then it becomes active — the client funds it and each stage is paid out once it’s verified."
			/>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex max-w-215 flex-col gap-6"
			>
				<CustomRadioGroup
					label="Your role"
					name="myRole"
					variant="rows"
					options={[
						{
							value: 'client',
							label: 'I’m hiring',
							description: `${counterpartyName} does the work; you pay`,
						},
						{
							value: 'provider',
							label: 'I’m doing the work',
							description: `${counterpartyName} pays you`,
						},
					]}
					value={form.values.myRole}
					onChange={(value) => form.setFieldValue('myRole', value)}
				/>
				<CustomInput
					label="Job title"
					name="jobTitle"
					required
					placeholder="e.g. Structural design for a 3-storey duplex"
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
					minHeight="140px"
					maxLength={3000}
					placeholder="Scope, deliverables, site / location, timelines."
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
				<fieldset>
					<legend className="font-label mb-3 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
						Stages
					</legend>
					<StageEditor
						value={form.values.stages}
						onChange={(stages) => form.setFieldValue('stages', stages)}
						totalAmount={form.values.totalAmount}
						currency={PLATFORM_CURRENCY}
						error={form.submitCount > 0 && form.errors.stages}
					/>
				</fieldset>
				<div>
					<AppButton
						type="submit"
						icon={<LuSend />}
						disabled={create.isPending}
					>
						{create.isPending ? 'Sending…' : 'Send for confirmation'}
					</AppButton>
				</div>
			</form>
		</>
	);
}

export default NewJob;
