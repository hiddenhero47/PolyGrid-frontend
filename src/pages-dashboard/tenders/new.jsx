import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuSend } from 'react-icons/lu';
import TenderServices from '../../features/services/custom-hooks/tenders';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import { AppButton } from '../../components/button';
import { PROFILE_TYPE } from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';
import EligibilityGate from '../elements/eligibility-gate';
import { BackLink } from '../elements/panels';
import ProjectFields from './elements/project-form';
import {
	projectPayload,
	projectSchema,
	projectValues,
} from './elements/project-schema';

// frontend-plan §B.7 — post a project to the sealed tender board. Needs a
// live client profile (the backend answers 402 otherwise).
function NewTenderProject() {
	const navigate = useNavigate();
	const create = TenderServices.create();

	const form = useFormik({
		initialValues: projectValues(),
		validationSchema: projectSchema,
		onSubmit: (values) =>
			create.mutate(
				{ fields: projectPayload(values), files: values.files },
				{
					onSuccess: (project) => {
						if (project.fileWarnings?.length)
							toast.warning(project.fileWarnings.join(' · '), {
								title: 'Some files weren’t attached',
							});
						else toast.success('Project posted — contractors can bid now');
						navigate(`${ROUTES.DASHBOARD_TENDERS}/${project.id}`, {
							replace: true,
						});
					},
				}
			),
	});

	return (
		<>
			<BackLink to={`${ROUTES.DASHBOARD_TENDERS}?view=projects`}>
				My projects
			</BackLink>
			<PageHeader
				eyebrow="PolyGrid Tenders"
				title="Post a project"
				subtitle="Verified contractors bid privately — no one sees anyone else’s price. Pick the bid you want and it becomes a job, with the money held in escrow."
			/>
			<EligibilityGate
				profileType={PROFILE_TYPE.CLIENT}
				action="post a project"
			>
				<form
					noValidate
					onSubmit={form.handleSubmit}
					className="flex max-w-215 flex-col gap-6"
				>
					<ProjectFields form={form} withFiles />
					<div>
						<AppButton
							type="submit"
							icon={<LuSend />}
							disabled={create.isPending}
						>
							{create.isPending ? 'Posting…' : 'Post project'}
						</AppButton>
					</div>
				</form>
			</EligibilityGate>
		</>
	);
}

export default NewTenderProject;
