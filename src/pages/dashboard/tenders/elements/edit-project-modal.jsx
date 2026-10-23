import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import ProjectFields from './project-form';
import { projectPayload, projectSchema, projectValues } from './project-schema';

// Edit an open project's details (files are managed on the page).
function EditProjectModal({ refName, project, onSubmit, isPending }) {
	const form = useFormik({
		initialValues: projectValues(project),
		enableReinitialize: true,
		validationSchema: projectSchema,
		onSubmit: (values) => onSubmit(projectPayload(values)),
	});

	return (
		<Modal.Center
			refName={refName}
			width="760px"
			queryWidth="100%"
			onOpen={() => form.resetForm({ values: projectValues(project) })}
		>
			<Modal.Card
				eyebrow="Edit project"
				title={project?.title}
				subtitle="Contractors who already bid see the updated details."
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
							form="edit-project-form"
							disabled={isPending}
						>
							{isPending ? 'Saving…' : 'Save changes'}
						</AppButton>
					</>
				}
			>
				<form id="edit-project-form" noValidate onSubmit={form.handleSubmit}>
					<ProjectFields form={form} />
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

EditProjectModal.propTypes = {
	refName: PropTypes.object.isRequired,
	project: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default EditProjectModal;
