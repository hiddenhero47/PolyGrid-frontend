import React from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import { LuArrowLeft, LuCloudOff, LuRotateCw } from 'react-icons/lu';
import ProfileServices from '../../../../features/services/custom-hooks/profiles';
import PageHeader from '../../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../../layouts/toast/toast-handler';
import AppLoader from '../../../../components/loader';
import EmptyState from '../../../../components/empty-state';
import SegmentedControl from '../../../../components/segmented-control';
import { AppButton } from '../../../../components/button';
import { ROUTES } from '../../../../utilities/app-routes';
import GoLive from '../../elements/go-live';
import { PROFILE_EDITORS, TAB_LABELS } from './config';
import EditorHeader from './elements/editor-header';
import DetailsForm from './elements/details-form';
import ServicesTab from './elements/services-tab';
import MentorshipTab from './elements/mentorship-tab';
import PortfolioTab from './elements/portfolio-tab';
import LinksTab from './elements/links-tab';

const BackLink = () => (
	<Link
		to={ROUTES.DASHBOARD_PROFILES}
		className="font-label mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
	>
		<LuArrowLeft aria-hidden="true" /> All profiles
	</Link>
);

// frontend-plan §B.3 — one editor for every business profile, shaped by
// ./config.js: a create form the first time, then the editor with
// ?tab=details|services|mentorship|portfolio|links (whichever this
// pillar has).
function ProfileEditor({ profileType }) {
	const config = PROFILE_EDITORS[profileType];
	const [params, setParams] = useSearchParams();
	const {
		data: profile,
		isPending,
		isError,
		refetch,
	} = ProfileServices.getMyProfile(profileType);
	const create = ProfileServices.createProfile(profileType);
	const update = ProfileServices.updateProfile(profileType);

	const tabs = ['details', ...config.tabs];
	const tab = tabs.includes(params.get('tab')) ? params.get('tab') : 'details';
	const counts = {
		services: profile?.services?.length,
		portfolio: profile?.portfolio?.length,
		links: profile?.links?.length,
	};

	if (isPending)
		return <AppLoader fullPage showLabel label="Loading your profile" />;

	if (isError) {
		return (
			<EmptyState
				tone="error"
				icon={<LuCloudOff />}
				title="Couldn’t load your profile"
				actions={
					<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
						Retry
					</AppButton>
				}
			/>
		);
	}

	if (!profile) {
		return (
			<>
				<BackLink />
				<PageHeader
					eyebrow={config.pillar}
					title={config.createTitle}
					subtitle={config.createSubtitle}
				/>
				<div className="max-w-[920px]">
					<DetailsForm
						config={config}
						onSubmit={(body) =>
							create.mutate(body, {
								onSuccess: () => {
									toast.success('Profile created');
									if (config.afterCreateTab)
										setParams({ tab: config.afterCreateTab });
								},
							})
						}
						isPending={create.isPending}
						submitLabel="Create profile"
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<BackLink />
			<EditorHeader
				profileType={profileType}
				config={config}
				profile={profile}
			/>
			<GoLive
				profileType={profileType}
				profile={profile}
				editTo={config.route}
				liveText={config.live}
			/>

			{tabs.length > 1 && (
				<div className="mt-8 mb-6 overflow-x-auto">
					<SegmentedControl
						label="Profile sections"
						options={tabs.map((value) => ({
							value,
							label: TAB_LABELS[value],
							count: counts[value],
						}))}
						value={tab}
						onChange={(value) =>
							setParams(value === 'details' ? {} : { tab: value }, {
								replace: true,
							})
						}
					/>
				</div>
			)}

			<div className={tabs.length > 1 ? '' : 'mt-8'}>
				{tab === 'details' && (
					<div className="max-w-[920px]">
						<DetailsForm
							config={config}
							profile={profile}
							onSubmit={(body) =>
								update.mutate(body, {
									onSuccess: () => toast.success('Details saved'),
								})
							}
							isPending={update.isPending}
						/>
					</div>
				)}
				{tab === 'services' && <ServicesTab profile={profile} />}
				{tab === 'mentorship' && <MentorshipTab profile={profile} />}
				{tab === 'portfolio' && (
					<PortfolioTab profileType={profileType} profile={profile} />
				)}
				{tab === 'links' && (
					<LinksTab profileType={profileType} profile={profile} />
				)}
			</div>
		</>
	);
}

ProfileEditor.propTypes = {
	profileType: PropTypes.string.isRequired,
};

export default ProfileEditor;
