import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal from '../../../../../components/modal/index_modal';
import { AppButton } from '../../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomRadioGroup,
} from '../../../../../components/form-components';
import { serviceSchema } from '../../../../../features/validations/profile-validation';
import {
	PLATFORM_CURRENCY,
	SERVICE_PRICING_MODE,
} from '../../../../../utilities/app-const';

const PRICING_OPTIONS = [
	{
		value: SERVICE_PRICING_MODE.FIXED,
		label: 'Fixed price',
		description: 'One price for a defined deliverable',
	},
	{
		value: SERVICE_PRICING_MODE.HOURLY,
		label: 'Hourly',
		description: 'Billed per hour worked',
	},
	{
		value: SERVICE_PRICING_MODE.PER_SESSION,
		label: 'Per session',
		description: 'A visit, call or meeting of set length',
	},
];

// Add or edit one service listing. The whole services array is saved
// with PATCH /me (there's no per-service route), so this just hands the
// listing back to the tab.
function ServiceModal({ refName, service, onSave, isPending }) {
	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			title: service?.title || '',
			description: service?.description || '',
			pricingMode: service?.pricingMode || SERVICE_PRICING_MODE.FIXED,
			price: service?.price ?? '',
			durationMinutes: service?.durationMinutes ?? '',
		},
		validationSchema: serviceSchema,
		onSubmit: (values) => {
			const listing = {
				...(service?._id && { _id: service._id }),
				title: values.title.trim(),
				description: values.description.trim() || undefined,
				pricingMode: values.pricingMode,
				price: Number(values.price),
				currency: PLATFORM_CURRENCY,
			};
			if (values.durationMinutes !== '' && values.durationMinutes != null) {
				listing.durationMinutes = Number(values.durationMinutes);
			}
			onSave(listing);
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<Modal.Center
			refName={refName}
			width="580px"
			queryWidth="100%"
			onClose={() => form.resetForm()}
		>
			<Modal.Card
				eyebrow="Services"
				title={service ? 'Edit service' : 'Add a service'}
				subtitle="Prices are in USD."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="service-form" disabled={isPending}>
							{isPending ? 'Saving…' : service ? 'Save service' : 'Add service'}
						</AppButton>
					</>
				}
			>
				<form
					id="service-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="flex flex-col gap-5"
				>
					<CustomInput
						label="Service"
						name="title"
						required
						placeholder="e.g. Structural design — residential"
						value={form.values.title}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('title')}
						errormessage={form.errors.title}
					/>
					<CustomTextarea
						label="What’s included"
						name="description"
						minHeight="96px"
						maxLength={600}
						value={form.values.description}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('description')}
						errormessage={form.errors.description}
					/>
					<CustomRadioGroup
						label="Pricing"
						name="pricingMode"
						variant="rows"
						options={PRICING_OPTIONS}
						value={form.values.pricingMode}
						onChange={form.handleChange}
					/>
					<div className="grid gap-5 sm:grid-cols-2">
						<CustomInput
							label={
								form.values.pricingMode === SERVICE_PRICING_MODE.HOURLY
									? 'Rate per hour (USD)'
									: form.values.pricingMode === SERVICE_PRICING_MODE.PER_SESSION
										? 'Price per session (USD)'
										: 'Price (USD)'
							}
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
						{form.values.pricingMode === SERVICE_PRICING_MODE.PER_SESSION && (
							<CustomInput
								label="Session length (minutes)"
								name="durationMinutes"
								type="number"
								inputMode="numeric"
								min="1"
								value={form.values.durationMinutes}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								isError={err('durationMinutes')}
								errormessage={form.errors.durationMinutes}
							/>
						)}
					</div>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

ServiceModal.propTypes = {
	refName: PropTypes.object.isRequired,
	service: PropTypes.object,
	onSave: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default ServiceModal;
