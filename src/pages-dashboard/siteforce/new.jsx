import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuSend } from 'react-icons/lu';
import SiteForceServices from '../../features/services/custom-hooks/siteforce';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import { AppButton } from '../../components/button';
import { PROFILE_TYPE } from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';
import EligibilityGate from '../elements/eligibility-gate';
import { BackLink } from '../elements/panels';
import OpeningFields from './elements/opening-form';
import {
	openingPayload,
	openingSchema,
	openingValues,
} from './elements/opening-schema';

// frontend-plan §B.10 — post a site job. Needs a live client profile
// (the backend answers 402 otherwise).
function NewJobOpening() {
	const navigate = useNavigate();
	const create = SiteForceServices.create();

	const form = useFormik({
		initialValues: openingValues(),
		validationSchema: openingSchema,
		onSubmit: (values) =>
			create.mutate(
				{ fields: openingPayload(values), files: values.files },
				{
					onSuccess: (opening) => {
						if (opening.fileWarnings?.length)
							toast.warning(opening.fileWarnings.join(' · '), {
								title: 'Some photos weren’t attached',
							});
						else toast.success('Posted — workers can apply now');
						navigate(`${ROUTES.DASHBOARD_SITEFORCE}/${opening.id}`, {
							replace: true,
						});
					},
				}
			),
	});

	return (
		<>
			<BackLink to={`${ROUTES.DASHBOARD_SITEFORCE}?view=postings`}>
				My postings
			</BackLink>
			<PageHeader
				eyebrow="PolyGrid SiteForce"
				title="Post a site job"
				subtitle="Verified workers nearby see the job and the general area. Accept the people you want — each becomes a job with the pay held in escrow, and only they get the exact location."
			/>
			<EligibilityGate
				profileType={PROFILE_TYPE.CLIENT}
				action="post a site job"
			>
				<form
					noValidate
					onSubmit={form.handleSubmit}
					className="flex max-w-215 flex-col gap-6"
				>
					<OpeningFields form={form} withFiles />
					<div>
						<AppButton
							type="submit"
							icon={<LuSend />}
							disabled={create.isPending}
						>
							{create.isPending ? 'Posting…' : 'Post job'}
						</AppButton>
					</div>
				</form>
			</EligibilityGate>
		</>
	);
}

export default NewJobOpening;
