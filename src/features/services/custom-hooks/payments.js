import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// polygrid-backend paymentRoutes.ts

// POST /api/payments/intent { targetType: 'Subscription', planTier,
// autoRenew? } — subscribe to a plan.
//   price 0 → activated on the spot: { requiresPayment: false, status:
//             'active', subscriptionId, paymentId }
//   paid    → a pending subscription + Stripe PaymentIntent:
//             { requiresPayment: true, clientSecret, paymentId,
//             subscriptionId }; Stripe's webhook activates it once the
//             card payment succeeds.
// Unused whole days of a current plan carry over onto the new one.
const useSubscribeMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ planTier, autoRenew = false }) =>
			axiosCall({
				url: '/api/payments/intent',
				method: 'POST',
				data: { targetType: 'Subscription', planTier, autoRenew },
			}),
		onSuccess: (res) => {
			if (!res.requiresPayment) refreshSubscription(queryClient);
		},
	});
};

// Everything that depends on the user's plan: the current plan, its
// history, payments, and each profile's go-live state.
export const refreshSubscription = (queryClient) => {
	queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
	queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
	queryClient.invalidateQueries({ queryKey: ['my-payments'] });
	queryClient.invalidateQueries({ queryKey: ['my-profile'] });
};

// GET /api/payments/me — every charge, any target type, newest first.
const useGetMyPaymentsQuery = ({ page = 1, limit = 10 } = {}) =>
	useQuery({
		queryKey: ['my-payments', { page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/payments/me',
				method: 'GET',
				params: { page, limit },
			}),
		placeholderData: keepPreviousData,
	});

// POST /api/payments/:id/refresh — asks Stripe directly about a payment
// that's still pending (e.g. its webhook never arrived) and, if it went
// through, activates what it paid for. Idempotent. Answers
// { status: 'success' | 'pending' | 'failed', payment, subscription? }.
// (The backend also sweeps stuck payments every 15 minutes.)
const useRefreshPaymentMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (paymentId) =>
			axiosCall({ url: `/api/payments/${paymentId}/refresh`, method: 'POST' }),
		onSuccess: () => refreshSubscription(queryClient),
	});
};

const PaymentServices = {
	refresh: useRefreshPaymentMutation,
	subscribe: useSubscribeMutation,
	getMyPayments: useGetMyPaymentsQuery,
};

export default PaymentServices;
