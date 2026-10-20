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

const SubscriptionServices = {
	getUserSubscriptions: useGetUserSubscriptionsQuery,
	grantSubscription: useGrantSubscriptionMutation,
};

export default SubscriptionServices;
