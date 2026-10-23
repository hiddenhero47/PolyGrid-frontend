import React from 'react';
import {
	LuArrowRight,
	LuPlus,
	LuExternalLink,
	LuCloudOff,
	LuRotateCw,
} from 'react-icons/lu';
import ProfileServices from '../../features/services/custom-hooks/profiles';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../components/empty-state';
import StatusBadge from '../../components/status-badge';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { PROFILE_TYPES } from '../elements/profile-types';
import { ProfileTypeCard } from '../elements/index.style';

// frontend-plan §B.3 — Business Profile hub: one card per pillar, either
// the profile this account has (verified / on-break at a glance) or a
// "create" card. Editors arrive pillar by pillar; consultancy is first.
function MyProfiles() {
	const { profiles, isPending, isError } = ProfileServices.getMyProfiles();

	return (
		<>
			<PageHeader
				eyebrow="Business"
				title="Profiles"
				subtitle="One account, a profile per pillar. Each profile is verified and listed on its own — set up only the ones you need."
			/>

			{isError && (
				<EmptyState
					compact
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load your profiles"
					actions={
						<AppButton
							icon={<LuRotateCw />}
							onClick={() => window.location.reload()}
						>
							Retry
						</AppButton>
					}
				/>
			)}

			<div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
				{PROFILE_TYPES.map(({ icon: Icon, ...meta }) => {
					const profile = profiles[meta.type];

					if (isPending && profile === undefined) {
						return (
							<ProfileTypeCard key={meta.type}>
								<SkeletonBar
									$width="44px"
									style={{ height: 44, borderRadius: 12 }}
								/>
								<SkeletonBar $width="60%" />
								<SkeletonBar $width="90%" />
							</ProfileTypeCard>
						);
					}

					return (
						<ProfileTypeCard key={meta.type} $empty={!profile}>
							<div className="flex items-start justify-between gap-3">
								<span className="sc_typeIcon" aria-hidden="true">
									<Icon />
								</span>
								{profile && (
									<div className="flex flex-wrap justify-end gap-2">
										<StatusBadge
											label={profile.isVerified ? 'Verified' : 'Not verified'}
											tone={profile.isVerified ? 'success' : 'warning'}
										/>
										{profile.status !== 'active' && (
											<StatusBadge
												label={
													profile.status === 'banned' ? 'Banned' : 'On a break'
												}
												tone={profile.status === 'banned' ? 'error' : 'neutral'}
											/>
										)}
									</div>
								)}
							</div>
							<div>
								<p className="sc_pillar">{meta.pillar}</p>
								<h3 className="sc_typeName">
									{profile ? meta.name(profile) || meta.label : meta.label}
								</h3>
							</div>
							<p className="sc_pitch">
								{profile ? `${meta.label} profile` : meta.pitch}
							</p>
							<div className="flex flex-wrap gap-2.5">
								{meta.editor ? (
									<AppButton
										size="sm"
										to={meta.editor}
										variant={profile ? 'secondary' : 'primary'}
										icon={profile ? <LuArrowRight /> : <LuPlus />}
									>
										{profile ? 'Manage' : 'Create profile'}
									</AppButton>
								) : (
									<AppButton size="sm" variant="secondary" disabled>
										{profile ? 'Editor coming soon' : 'Coming soon'}
									</AppButton>
								)}
								{profile && meta.publicPath && (
									<AppButton
										size="sm"
										variant="secondary"
										href={meta.publicPath(profile)}
										target="_blank"
										icon={<LuExternalLink />}
									>
										Public page
									</AppButton>
								)}
							</div>
						</ProfileTypeCard>
					);
				})}
			</div>
		</>
	);
}

export default MyProfiles;
