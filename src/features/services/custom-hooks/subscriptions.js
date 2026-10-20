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

const SubscriptionServices = {
	getCurrentSubscription: useGetCurrentSubscriptionQuery,
	getMySubscriptions: useGetMySubscriptionsQuery,
	getUserSubscriptions: useGetUserSubscriptionsQuery,
	grantSubscription: useGrantSubscriptionMutation,
};

export default SubscriptionServices;
