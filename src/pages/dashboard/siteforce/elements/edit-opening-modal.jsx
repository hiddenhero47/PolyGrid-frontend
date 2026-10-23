import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import OpeningFields from './opening-form';
import { openingPayload, openingSchema, openingValues } from './opening-schema';

// Edit an open job's details (photos are managed on the page).
function EditOpeningModal({ refName, opening, onSubmit, isPending }) {
	const form = useFormik({
		initialValues: openingValues(opening),
		enableReinitialize: true,
		validationSchema: openingSchema,
		onSubmit: (values) => onSubmit(openingPayload(values)),
	});

	return (
		<Modal.Center
			refName={refName}
			width="820px"
			queryWidth="100%"
			onOpen={() => form.resetForm({ values: openingValues(opening) })}
		>
			<Modal.Card
				eyebrow="Edit site job"
				title={opening?.title}
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
							form="edit-opening-form"
							disabled={isPending}
						>
							{isPending ? 'Saving…' : 'Save changes'}
						</AppButton>
					</>
				}
			>
				<form id="edit-opening-form" noValidate onSubmit={form.handleSubmit}>
					<OpeningFields form={form} />
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

EditOpeningModal.propTypes = {
	refName: PropTypes.object.isRequired,
	opening: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default EditOpeningModal;
