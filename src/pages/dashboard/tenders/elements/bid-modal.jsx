import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
} from '../../../../components/form-components';
import { PLATFORM_CURRENCY } from '../../../../utilities/app-const';

const schema = yup.object({
	amount: yup
		.number()
		.typeError('Enter your price')
		.moreThan(0, 'Enter your price')
		.required('Enter your price'),
	estimatedDurationDays: yup
		.number()
		.transform((v, o) => (o === '' ? null : v))
		.typeError('Enter a number of days')
		.integer('Whole days')
		.min(1, 'At least 1 day')
		.nullable(),
	proposal: yup
		.string()
		.trim()
		.min(20, 'Say a bit more — at least 20 characters')
		.max(5000)
		.required('Write your proposal'),
});

const fromBid = (bid) => ({
	amount: bid?.amount ?? '',
	estimatedDurationDays: bid?.estimatedDurationDays ?? '',
	proposal: bid?.proposal || '',
});

// Place a bid, or revise my pending one (frontend-plan §B.9). Sealed:
// only the poster ever sees it.
function BidModal({ refName, bid, projectTitle, onSubmit, isPending }) {
	const form = useFormik({
		initialValues: fromBid(bid),
		enableReinitialize: true,
		validationSchema: schema,
		onSubmit: (values) =>
			onSubmit({
				amount: Number(values.amount),
				currency: PLATFORM_CURRENCY,
				proposal: values.proposal.trim(),
				...(values.estimatedDurationDays !== '' &&
					values.estimatedDurationDays != null && {
						estimatedDurationDays: Number(values.estimatedDurationDays),
					}),
			}),
	});
	const err = (name) =>
		((form.touched[name] || form.submitCount > 0) && form.errors[name]) ||
		false;

	return (
		<Modal.Center
			refName={refName}
			width="620px"
			queryWidth="100%"
			onOpen={() => form.resetForm({ values: fromBid(bid) })}
		>
			<Modal.Card
				eyebrow={bid ? 'Revise your bid' : 'Place a bid'}
				title={projectTitle}
				subtitle="Sealed — other contractors never see your price. You can revise or withdraw it until bids close."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="bid-form" disabled={isPending}>
							{isPending ? 'Sending…' : bid ? 'Save changes' : 'Send bid'}
						</AppButton>
					</>
				}
			>
				<form
					id="bid-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="flex flex-col gap-5"
				>
					<div className="grid gap-5 sm:grid-cols-2">
						<CustomInput
							label="Your price (USD)"
							name="amount"
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							required
							value={form.values.amount}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('amount')}
							errormessage={form.errors.amount}
						/>
						<CustomInput
							label="Duration (days)"
							name="estimatedDurationDays"
							type="number"
							inputMode="numeric"
							min="1"
							hint="Optional"
							value={form.values.estimatedDurationDays}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('estimatedDurationDays')}
							errormessage={form.errors.estimatedDurationDays}
						/>
					</div>
					<CustomTextarea
						label="Proposal"
						name="proposal"
						required
						minHeight="160px"
						maxLength={5000}
						placeholder="How you’d do it, what’s included, crew and equipment, similar work you’ve done."
						value={form.values.proposal}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('proposal')}
						errormessage={form.errors.proposal}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

BidModal.propTypes = {
	refName: PropTypes.object.isRequired,
	bid: PropTypes.object,
	projectTitle: PropTypes.string,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default BidModal;
