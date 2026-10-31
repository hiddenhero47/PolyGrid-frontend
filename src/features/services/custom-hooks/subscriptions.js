import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Subscriptions — polygrid-backend subscriptionRoutes.ts.

// GET /api/subscriptions/users/:userId — admin / super_admin. A user's
// subscription history, newest first: { data, pagination }.
const useGetUserSubscriptionsQuery = ({ userId, page = 1, limit = 10 }) =>
	useQuery({
		queryKey: ['user-subscriptions', userId, { page, limit }],
		queryFn: () =>
			axiosCall({
				url: `/api/subscriptions/users/${userId}`,
				method: 'GET',
				params: { page, limit },
			}),
		enabled: Boolean(userId),
		placeholderData: keepPreviousData,
	});

// POST /api/subscriptions { userId, planTier, autoRenew? } — admin /
// super_admin. Grants a plan by hand (a MANUAL payment is recorded);
// needs an active plan for that tier.
const useGrantSubscriptionMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/subscriptions', method: 'POST', data }),
		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({
				queryKey: ['user-subscriptions', userId],
			});
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
		},
	});
};

// GET /api/subscriptions/current — { currentPlan: subscription | null }
// (null = no live subscription; an expired one is null too).
const useGetCurrentSubscriptionQuery = (options = {}) =>
	useQuery({
		queryKey: ['my-subscription'],
		queryFn: () =>
			axiosCall({ url: '/api/subscriptions/current', method: 'GET' }),
		select: (res) => res?.currentPlan ?? null,
		...options,
	});

// GET /api/subscriptions/me — my history, newest first
const useGetMySubscriptionsQuery = ({ page = 1, limit = 10 } = {}) =>
	useQuery({
		queryKey: ['my-subscriptions', { page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/subscriptions/me',
				method: 'GET',
				params: { page, limit },
			}),
		placeholderData: keepPreviousData,
	});

// After a card payment: poll GET /api/subscriptions/current until Stripe's
// webhook has made `subscriptionId` the live subscription, then call
// onActive once (from the fetch itself, not from render). Gives up after
// MAX_POLLS (~1 min) — the payment has gone through either way; the plan
// appears whenever the webhook lands. `data` is 'waiting' | 'active' |
// 'gave-up' (as `.gaveUp`). Idle when subscriptionId is null.
const MAX_POLLS = 24;
const useAwaitActivationQuery = (subscriptionId, onActive) => {
	const queryClient = useQueryClient();
	const queryKey = ['await-activation', subscriptionId];
	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const polls = (queryClient.getQueryData(queryKey)?.polls ?? 0) + 1;
			const res = await axiosCall({
				url: '/api/subscriptions/current',
				method: 'GET',
				silent: true,
			});
			if (res?.currentPlan?._id === subscriptionId) {
				onActive?.(res.currentPlan);
				return { status: 'active', polls };
			}
			return { status: polls >= MAX_POLLS ? 'gave-up' : 'waiting', polls };
		},
		enabled: Boolean(subscriptionId),
		refetchInterval: (q) =>
			q.state.data && q.state.data.status !== 'waiting' ? false : 2500,
		gcTime: 0,
	});
	return { ...query, gaveUp: query.data?.status === 'gave-up' };
};

const SubscriptionServices = {
	awaitActivation: useAwaitActivationQuery,
	getCurrentSubscription: useGetCurrentSubscriptionQuery,
	getMySubscriptions: useGetMySubscriptionsQuery,
	getUserSubscriptions: useGetUserSubscriptionsQuery,
	grantSubscription: useGrantSubscriptionMutation,
};

export default SubscriptionServices;
