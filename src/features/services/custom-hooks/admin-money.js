import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';
import { JOBS_KEY } from './jobs';

// The money side of the Admin Dashboard (frontend-plan §C.7–C.11,
// polygrid-backend jobRoutes.ts / paymentRoutes.ts). Queues are visible to
// every review role; deciding (resolve, approve, decline, record a manual
// payment) and the full payments ledger are admin / super_admin only.

export const ADMIN_MONEY_KEY = ['admin-money'];

const pagedGet = (url, params, silent) =>
	axiosCall({ url, method: 'GET', params, silent });

// GET /api/jobs/disputes — disputed jobs, raw, with client.userId /
// provider.userId / disputedBy populated ({ fullName, email })
const useDisputesQuery = ({ page = 1, limit = 10 } = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'disputes', { page, limit }],
		queryFn: () => pagedGet('/api/jobs/disputes', { page, limit }),
		placeholderData: keepPreviousData,
		...options,
	});

// GET /api/jobs/refund-requests → rows { jobId, jobTitle, client, provider,
// refundable, refund } — the one pending request per job
const useRefundRequestsQuery = ({ page = 1, limit = 10 } = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'refunds', { page, limit }],
		queryFn: () => pagedGet('/api/jobs/refund-requests', { page, limit }),
		placeholderData: keepPreviousData,
		...options,
	});

// GET /api/jobs/payout-requests → rows { jobId, jobTitle, client, provider,
// available, payout }
const usePayoutRequestsQuery = ({ page = 1, limit = 10 } = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'payouts', { page, limit }],
		queryFn: () => pagedGet('/api/jobs/payout-requests', { page, limit }),
		placeholderData: keepPreviousData,
		...options,
	});

// GET /api/payments?status=&targetType=&targetId=&user=&provider=&page=
// — every payment record (admin / super_admin)
const usePaymentsQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'payments', filters],
		queryFn: () =>
			pagedGet(
				'/api/payments',
				Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
			),
		placeholderData: keepPreviousData,
		...options,
	});

// GET /api/jobs/:id — any job, for admin / super_admin (customer care
// gets 403 — the drawer then shows the queue row's details only)
const useJobQuery = (id, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'job', id],
		queryFn: () =>
			axiosCall({ url: `/api/jobs/${id}`, method: 'GET', silent: true }),
		enabled: Boolean(id),
		retry: (count, error) => error?.response?.status !== 403 && count < 2,
		...options,
	});

// GET /api/jobs/:id/payments — that job's payment records (every review role)
const useJobPaymentsQuery = (id, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'job-payments', id],
		queryFn: () =>
			axiosCall({ url: `/api/jobs/${id}/payments`, method: 'GET' }),
		enabled: Boolean(id),
		...options,
	});

const useMoneyWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ADMIN_MONEY_KEY });
			queryClient.invalidateQueries({ queryKey: JOBS_KEY });
		},
	});
};

// PATCH /api/jobs/:id/dispute/resolve { note } — appended to the job's
// dispute history; the job goes back to active and both sides are told
const useResolveDisputeMutation = () =>
	useMoneyWrite(({ id, note }) =>
		axiosCall({
			url: `/api/jobs/${id}/dispute/resolve`,
			method: 'PATCH',
			data: { note },
		})
	);

// Approving pays out what the backend works out (refundable / available)
// and records money owed in its payout ledger; it refuses (400) if the
// recipient has no payout account. Approving a refund closes the job.
const useDecideRequestMutation = (kind, decision) =>
	useMoneyWrite(({ jobId, requestId, declineReason }) =>
		axiosCall({
			url: `/api/jobs/${jobId}/${kind}-requests/${requestId}/${decision}`,
			method: 'PATCH',
			...(decision === 'decline' && { data: { declineReason } }),
		})
	);
const useApproveRefundMutation = () =>
	useDecideRequestMutation('refund', 'approve');
const useDeclineRefundMutation = () =>
	useDecideRequestMutation('refund', 'decline');
const useApprovePayoutMutation = () =>
	useDecideRequestMutation('payout', 'approve');
const useDeclinePayoutMutation = () =>
	useDecideRequestMutation('payout', 'decline');

// POST /api/jobs/:id/payments { amount } — record money the client paid
// outside Stripe (a "manual" payment); adds to the job's funded amount
const useRecordPaymentMutation = () =>
	useMoneyWrite(({ id, amount }) =>
		axiosCall({
			url: `/api/jobs/${id}/payments`,
			method: 'POST',
			data: { amount },
		})
	);

const AdminMoneyServices = {
	disputes: useDisputesQuery,
	refundRequests: useRefundRequestsQuery,
	payoutRequests: usePayoutRequestsQuery,
	payments: usePaymentsQuery,
	job: useJobQuery,
	jobPayments: useJobPaymentsQuery,
	resolveDispute: useResolveDisputeMutation,
	approveRefund: useApproveRefundMutation,
	declineRefund: useDeclineRefundMutation,
	approvePayout: useApprovePayoutMutation,
	declinePayout: useDeclinePayoutMutation,
	recordPayment: useRecordPaymentMutation,
};

export default AdminMoneyServices;
