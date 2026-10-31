import React from 'react';
import PropTypes from 'prop-types';
import { LuLock, LuPlus } from 'react-icons/lu';
import ProfileServices from '../../features/services/custom-hooks/profiles';
import AppLoader from '../../components/loader';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import GoLive from './go-live';
import { useGoLiveState } from './go-live-state';
import { PROFILE_TYPES } from './profile-types';

// "You need a live <profile> for this" (frontend-plan §B.7 / §B.8 /
// §B.10 / §B.11): posting needs a live client profile, the boards a live
// contractor / worker profile. With `assumeBlocked` (the backend already
// said no — a 403 from a board) the checklist shows even if our own
// reading of the profile looks live; otherwise children render once the
// profile is live. The backend re-checks every call either way.
function EligibilityGate({
	profileType,
	action,
	assumeBlocked = false,
	children,
}) {
	const meta = PROFILE_TYPES.find((p) => p.type === profileType);
	const { data: profile, isPending } =
		ProfileServices.getMyProfile(profileType);
	const state = useGoLiveState(profileType, profile);

	if (isPending || (profile && state.isPending))
		return <AppLoader fullPage showLabel />;

	if (!profile) {
		return (
			<EmptyState
				tone="accent"
				icon={<LuLock />}
				eyebrow={meta?.pillar}
				title={`You need a ${meta?.label.toLowerCase()} profile`}
				text={`To ${action}, set up a ${meta?.label.toLowerCase()} profile, get it verified and keep a plan active.`}
				actions={
					<AppButton to={meta?.editor} icon={<LuPlus />}>
						Create the profile
					</AppButton>
				}
			/>
		);
	}

	if (state.live && !assumeBlocked) return children;

	return (
		<div className="flex flex-col gap-5">
			<EmptyState
				tone="accent"
				icon={<LuLock />}
				eyebrow={meta?.pillar}
				title="Almost there"
				text={`To ${action}, your ${meta?.label.toLowerCase()} profile has to be verified, taking work, and backed by an active plan.`}
			/>
			<GoLive
				profileType={profileType}
				profile={profile}
				editTo={meta?.editor}
				liveText={{
					on: 'Your profile is live — if this still says no, your plan may have just lapsed. Check Subscription.',
					off: 'Finish these and come back.',
				}}
			/>
		</div>
	);
}

EligibilityGate.propTypes = {
	profileType: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
	assumeBlocked: PropTypes.bool,
	children: PropTypes.node,
};

export default EligibilityGate;
