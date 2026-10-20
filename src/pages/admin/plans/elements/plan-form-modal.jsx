import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomToggle,
} from '../../../../components/form-components';
import { humanize } from '../../../../utilities/basic-functions';

// Mirrors polygrid-backend validators/plan/planValidator.ts. `privileges`
// is edited one per line; the tier is fixed once a plan exists.
const planSchema = yup.object({
	name: yup.string().trim().required('Give the plan a name'),
	duration: yup
		.number()
		.typeError('Enter a number of days')
		.integer('Whole days only')
		.moreThan(0, 'At least 1 day')
		.required('How many days does it last?'),
	price: yup
		.number()
		.typeError('Enter a price')
		.min(0, 'Can’t be negative')
		.required('Enter a price (0 for free)'),
	currency: yup
		.string()
		.trim()
		.matches(/^[A-Za-z]{3}$/, 'A 3-letter code, e.g. USD or NGN'),
	maxUsers: yup
		.number()
		.transform((value, original) => (original === '' ? null : value))
		.typeError('Enter a number')
		.integer('Whole number only')
		.min(0, 'Can’t be negative')
		.nullable(),
});

const toLines = (text) =>
	text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

const blank = (value) => value === '' || value == null;

function PlanFormModal({ refName, tier, plan, onSubmit, isPending }) {
	const editing = Boolean(plan);

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			name: plan?.name ?? (tier ? `${humanize(tier)} plan` : ''),
			duration: plan?.duration ?? 30,
			price: plan?.price ?? '',
			currency: plan?.currency ?? 'USD',
			maxUsers: plan?.maxUsers ?? '',
			privileges: (plan?.privileges || []).join('\n'),
			isActive: plan?.isActive ?? true,
		},
		validationSchema: planSchema,
		onSubmit: (values) => {
			const body = {
				name: values.name.trim(),
				duration: Number(values.duration),
				price: Number(values.price),
				currency: values.currency.trim().toUpperCase() || undefined,
				privileges: toLines(values.privileges),
			};
			// empty = no limit; on an edit, null clears an existing limit
			if (!blank(values.maxUsers)) body.maxUsers = Number(values.maxUsers);
			else if (editing) body.maxUsers = null;
			onSubmit(
				editing
					? { ...body, isActive: values.isActive }
					: { ...body, planTier: tier }
			);
		},
	});

	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<Modal.Center
			refName={refName}
			width="600px"
			queryWidth="100%"
			onClose={() => form.resetForm()}
		>
			<Modal.Card
				eyebrow={`${humanize(tier || plan?.planTier || '')} tier`}
				title={editing ? 'Edit plan' : 'Create plan'}
				subtitle="Subscribers keep the terms they signed up on; changes apply to new and renewed subscriptions."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="plan-form" disabled={isPending}>
							{isPending ? 'Saving…' : editing ? 'Save changes' : 'Create plan'}
						</AppButton>
					</>
				}
			>
				<form
					id="plan-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="grid gap-5 sm:grid-cols-2"
				>
					<div className="sm:col-span-2">
						<CustomInput
							label="Name"
							name="name"
							required
							value={form.values.name}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('name')}
							errormessage={form.errors.name}
						/>
					</div>
					<CustomInput
						label="Price"
						name="price"
						type="number"
						inputMode="decimal"
						min="0"
						step="0.01"
						required
						value={form.values.price}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('price')}
						errormessage={form.errors.price}
					/>
					<CustomInput
						label="Currency"
						name="currency"
						hint="ISO code — USD if left empty"
						maxLength={3}
						value={form.values.currency}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('currency')}
						errormessage={form.errors.currency}
					/>
					<CustomInput
						label="Duration (days)"
						name="duration"
						type="number"
						inputMode="numeric"
						min="1"
						required
						value={form.values.duration}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('duration')}
						errormessage={form.errors.duration}
					/>
					<CustomInput
						label="Max team members"
						name="maxUsers"
						type="number"
						inputMode="numeric"
						min="0"
						hint="Leave empty for no limit"
						value={form.values.maxUsers}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('maxUsers')}
						errormessage={form.errors.maxUsers}
					/>
					<div className="sm:col-span-2">
						<CustomTextarea
							label="Privileges"
							name="privileges"
							hint="One per line — shown to users as the plan’s features"
							minHeight="120px"
							value={form.values.privileges}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
						/>
					</div>
					{editing && (
						<div className="sm:col-span-2">
							<CustomToggle
								name="isActive"
								checked={form.values.isActive}
								onChange={form.handleChange}
								hint="Inactive plans can’t be bought or granted"
							>
								Active
							</CustomToggle>
						</div>
					)}
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

PlanFormModal.propTypes = {
	refName: PropTypes.object.isRequired,
	tier: PropTypes.string,
	plan: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default PlanFormModal;
