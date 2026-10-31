import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	LuBadgeCheck,
	LuClock,
	LuCircleX,
	LuFileQuestion,
	LuBriefcaseBusiness,
	LuRotateCw,
} from 'react-icons/lu';
import ProfileServices from '../../features/services/custom-hooks/profiles';
import VerificationServices from '../../features/services/custom-hooks/verification';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import AppLoader from '../../components/loader';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import { CustomSelect } from '../../components/form-components';
import { ROUTES } from '../../utilities/app-routes';
import { countryName } from '../../utilities/basic-functions';
import { PROFILE_TYPES, profileTypeMeta } from '../elements/profile-types';
import TemplateForm from './elements/template-form';
import VerificationHistory from './elements/history';

const STATE_INFO = {
	approved: {
		icon: LuBadgeCheck,
		tone: 'success',
		title: 'Verified',
		text: 'This profile is verified. You only need to submit again if your details change.',
	},
	pending: {
		icon: LuClock,
		tone: 'accent',
		title: 'Under review',
		text: 'Your documents are with our review team. You’ll get a notification when there’s a decision.',
	},
	rejected: {
		icon: LuCircleX,
		tone: 'error',
		title: 'Not approved',
		text: 'See the reason below, fix it and submit again.',
	},
};

// frontend-plan §B.4 — Verification Center. Pick a profile, look up what
// its country requires (template), submit answers + one file per
// required document; below, every past submission. ?profileType=
function VerificationCenter() {
	const [params, setParams] = useSearchParams();
	const { profiles, isPending: profilesPending } =
		ProfileServices.getMyProfiles();
	const owned = PROFILE_TYPES.filter((meta) => profiles[meta.type]);

	const profileType = owned.some((m) => m.type === params.get('profileType'))
		? params.get('profileType')
		: owned[0]?.type || '';
	const profile = profiles[profileType];
	const meta = profileTypeMeta(profileType);

	const [state, setState] = useState('');
	const [resubmit, setResubmit] = useState(false);
	const country = profile?.country || '';
	const { data: states = [] } = ReferenceServices.getStates(country);

	const template = VerificationServices.lookupTemplate({
		profileType,
		country,
		state,
	});
	const history = VerificationServices.getMyVerifications(
		profileType || undefined
	);
	const submit = VerificationServices.submitVerification();

	const mine = (history.data?.data || []).filter(
		(v) => String(v.profileId) === String(profile?.id)
	);
	const latest = mine[0];
	const status = profile?.isVerified ? 'approved' : latest?.status;
	const showForm = !status || status === 'rejected' || resubmit;
	const info = STATE_INFO[status];

	const handleSubmit = ({ form, documents }) =>
		submit.mutate(
			{
				fields: {
					profileType,
					profileId: profile.id,
					country,
					...(state && { state }),
					form,
				},
				documents,
			},
			{
				onSuccess: () => {
					setResubmit(false);
					toast.success('Submitted — we’ll review it shortly');
				},
			}
		);

	if (profilesPending) return <AppLoader fullPage showLabel label="Loading" />;

	return (
		<>
			<PageHeader
				eyebrow="Business"
				title="Verification"
				subtitle="Verified profiles carry a badge and can be listed publicly. What you need to submit depends on the profile type and your country."
			/>

			{!owned.length ? (
				<EmptyState
					tone="accent"
					icon={<LuBriefcaseBusiness />}
					title="Create a profile first"
					text="Verification is per business profile — set one up, then come back here."
					actions={
						<AppButton to={ROUTES.DASHBOARD_PROFILES}>Go to profiles</AppButton>
					}
				/>
			) : (
				<div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
					<div className="flex min-w-0 flex-col gap-6">
						<div className="grid gap-5 sm:grid-cols-2">
							<CustomSelect
								label="Profile"
								name="profileType"
								options={owned.map((m) => ({
									value: m.type,
									label: `${m.label} — ${m.name(profiles[m.type]) || ''}`,
								}))}
								value={profileType}
								onChange={(value) => {
									setState('');
									setResubmit(false);
									setParams({ profileType: value }, { replace: true });
								}}
							/>
							{showForm && states.length > 0 && (
								<CustomSelect
									label="State / region"
									name="state"
									placeholder="Not needed in most places"
									clearable
									options={states.map((s) => ({
										value: s.isoCode,
										label: s.name,
									}))}
									value={state}
									onChange={setState}
									hint={`Location: ${countryName(country)}, from your profile`}
								/>
							)}
						</div>

						{info && (
							<EmptyState
								compact
								tone={info.tone}
								icon={<info.icon />}
								eyebrow={meta?.label}
								title={info.title}
								text={info.text}
								actions={
									status !== 'rejected' &&
									!resubmit && (
										<AppButton
											size="sm"
											variant="secondary"
											icon={<LuRotateCw />}
											onClick={() => setResubmit(true)}
										>
											Submit again
										</AppButton>
									)
								}
							/>
						)}

						{showForm &&
							(template.isPending ? (
								<AppLoader showLabel label="Loading requirements" />
							) : template.isError || !template.data ? (
								<EmptyState
									compact
									icon={<LuFileQuestion />}
									title="No requirements set for this location yet"
									text={`We haven’t published what a ${meta?.label.toLowerCase()} in ${countryName(country)} needs to submit. Check back soon, or contact support.`}
								/>
							) : (
								<section
									aria-labelledby="requirements-heading"
									className="rounded-[18px] border border-(--pg-card-border) bg-(--pg-surface-background) p-5 md:p-6"
								>
									<h3
										id="requirements-heading"
										className="font-display mb-1 text-xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase"
									>
										What we need
									</h3>
									<p className="mb-6 text-[15px] text-(--pg-text-secondary)">
										Fill in every required field and attach the documents below,
										then submit — it all goes in one submission.
									</p>
									<TemplateForm
										key={`${profileType}-${template.data._id}`}
										template={template.data}
										onSubmit={handleSubmit}
										isPending={submit.isPending}
									/>
								</section>
							))}
					</div>

					<aside aria-labelledby="history-heading">
						<h3
							id="history-heading"
							className="font-label mb-3 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase"
						>
							Submission history
						</h3>
						{history.isPending ? (
							<AppLoader showLabel label="Loading history" />
						) : (
							<VerificationHistory items={mine} />
						)}
					</aside>
				</div>
			)}
		</>
	);
}

export default VerificationCenter;
