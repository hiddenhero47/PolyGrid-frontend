import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LuArrowLeft, LuCloudOff, LuRotateCw } from 'react-icons/lu';
import ProfileServices from '../../../../features/services/custom-hooks/profiles';
import PageHeader from '../../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../../layouts/toast/toast-handler';
import AppLoader from '../../../../components/loader';
import EmptyState from '../../../../components/empty-state';
import SegmentedControl from '../../../../components/segmented-control';
import { AppButton } from '../../../../components/button';
import { PROFILE_TYPE } from '../../../../utilities/app-const';
import { ROUTES } from '../../../../utilities/app-routes';
import GoLive from '../../elements/go-live';
import EditorHeader from './elements/editor-header';
import DetailsForm from './elements/details-form';
import ServicesTab from './elements/services-tab';
import MentorshipTab from './elements/mentorship-tab';
import PortfolioTab from './elements/portfolio-tab';
import LinksTab from './elements/links-tab';

const TYPE = PROFILE_TYPE.CONSULTANCY;

const TABS = [
	{ value: 'details', label: 'Details' },
	{ value: 'services', label: 'Services' },
	{ value: 'mentorship', label: 'Mentorship' },
	{ value: 'portfolio', label: 'Portfolio' },
	{ value: 'links', label: 'Links' },
];

const BackLink = () => (
	<Link
		to={ROUTES.DASHBOARD_PROFILES}
		className="font-label mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
	>
		<LuArrowLeft aria-hidden="true" /> All profiles
	</Link>
);

// frontend-plan §B.3a — Consultancy profile: a create form the first
// time, then the editor (?tab=details|services|mentorship|portfolio|links).
function ConsultancyEditor() {
	const [params, setParams] = useSearchParams();
	const {
		data: profile,
		isPending,
		isError,
		refetch,
	} = ProfileServices.getMyProfile(TYPE);
	const create = ProfileServices.createProfile(TYPE);
	const update = ProfileServices.updateProfile(TYPE);

	const tab = TABS.some((t) => t.value === params.get('tab'))
		? params.get('tab')
		: 'details';
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
					eyebrow="PolyGrid Engineering"
					title="Become a consultant"
					subtitle="Start with the basics — you can add services, mentorship and portfolio projects next. Your profile goes public once it’s verified and you have an active plan."
				/>
				<div className="max-w-[920px]">
					<DetailsForm
						onSubmit={(body) =>
							create.mutate(body, {
								onSuccess: () => {
									toast.success('Profile created — now add your services');
									setParams({ tab: 'services' });
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
			<EditorHeader profile={profile} />
			<GoLive
				profileType={TYPE}
				profile={profile}
				editTo={ROUTES.DASHBOARD_CONSULTANCY}
			/>

			<div className="mt-8 mb-6 overflow-x-auto">
				<SegmentedControl
					label="Profile sections"
					options={TABS.map((t) => ({ ...t, count: counts[t.value] }))}
					value={tab}
					onChange={(value) =>
						setParams(value === 'details' ? {} : { tab: value }, {
							replace: true,
						})
					}
				/>
			</div>

			{tab === 'details' && (
				<div className="max-w-[920px]">
					<DetailsForm
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
			{tab === 'portfolio' && <PortfolioTab profile={profile} />}
			{tab === 'links' && <LinksTab profile={profile} />}
		</>
	);
}

export default ConsultancyEditor;
