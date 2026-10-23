import VerificationServices from '../../features/services/custom-hooks/verification';
import SubscriptionServices from '../../features/services/custom-hooks/subscriptions';

// The latest submission for this profile (the list is newest first).
export const latestVerification = (verifications = [], profileId) =>
	verifications.find((v) => String(v.profileId) === String(profileId));

// Live state of a profile: it shows publicly only when it's verified,
// active (not on a break) and its owner has a live subscription
// (frontend-plan §0).
export const useGoLiveState = (profileType, profile) => {
	const verifications = VerificationServices.getMyVerifications(profileType);
	const subscription = SubscriptionServices.getCurrentSubscription();
	const latest = latestVerification(verifications.data?.data, profile?.id);

	const verification = profile?.isVerified
		? 'done'
		: latest?.status === 'pending'
			? 'waiting'
			: latest?.status === 'rejected'
				? 'failed'
				: 'todo';
	const subscribed = Boolean(subscription.data);
	const active = profile?.status === 'active';

	return {
		verification,
		latest,
		subscribed,
		active,
		live: verification === 'done' && subscribed && active,
		isPending: verifications.isPending || subscription.isPending,
	};
};
