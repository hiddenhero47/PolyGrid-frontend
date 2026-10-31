import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import { CustomTextarea } from '../../../components/form-components';
import { PROFILE_TYPE_LABELS } from '../../../utilities/app-const';

// PATCH /api/verifications/:id/reject { reason } — the reason is required
// and is what the user is told, so it's worded for them.
function RejectModal({ refName, verification, onSubmit, isPending }) {
	const form = useFormik({
		initialValues: { reason: '' },
		validationSchema: yup.object({
			reason: yup
				.string()
				.trim()
				.min(10, 'Give the user a little more to go on')
				.required('A rejection reason is required'),
		}),
		onSubmit: ({ reason }) => onSubmit(reason.trim()),
	});

	return (
		<Modal.Center
			refName={refName}
			width="540px"
			queryWidth="100%"
			onClose={() => form.resetForm()}
		>
			<Modal.Card
				eyebrow="Reject verification"
				title={verification?.user?.fullName || 'Reject'}
				subtitle={
					verification &&
					`${PROFILE_TYPE_LABELS[verification.profileType] || verification.profileType} profile — the user sees this reason and can resubmit.`
				}
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton
							type="submit"
							form="reject-verification-form"
							disabled={isPending}
						>
							{isPending ? 'Rejecting…' : 'Reject'}
						</AppButton>
					</>
				}
			>
				<form
					id="reject-verification-form"
					noValidate
					onSubmit={form.handleSubmit}
				>
					<CustomTextarea
						label="Reason"
						name="reason"
						required
						placeholder="e.g. The ID document is blurry — please upload a clearer photo."
						hint="Be specific about what to fix."
						maxLength={500}
						minHeight="130px"
						value={form.values.reason}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={(form.touched.reason && form.errors.reason) || false}
						errormessage={form.errors.reason}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

RejectModal.propTypes = {
	refName: PropTypes.object.isRequired,
	verification: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default RejectModal;
