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

// GET /api/jobs/:id — any job, read-only for every review role
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

// GET /api/system-payouts?status=&requestType=&page= — money PolyGrid owes
// after an approved refund / payout: { id, requestType, jobTitle, targetId,
// amount, currency, status: pending|paid|failed, payoutAccount (snapshot
// taken at approval), recipient: { fullName, email }, transferReference,
// failureReason, createdAt } (admin / super_admin)
const useSystemPayoutsQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'system-payouts', filters],
		queryFn: () =>
			pagedGet(
				'/api/system-payouts',
				Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
			),
		placeholderData: keepPreviousData,
		...options,
	});

// GET /api/jobs?q=&status=&userId=&page= — find any job (admin /
// super_admin); q matches the title or either party's name / email; rows
// are job summaries with party names
const useSearchJobsQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...ADMIN_MONEY_KEY, 'jobs', filters],
		queryFn: () =>
			pagedGet(
				'/api/jobs',
				Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
			),
		placeholderData: keepPreviousData,
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

// PATCH /api/system-payouts/:id/paid { transferReference? } — the
// transfer was made; …/failed { failureReason } — it bounced. Either way
// the recipient is emailed and notified.
const useMarkPayoutPaidMutation = () =>
	useMoneyWrite(({ id, transferReference }) =>
		axiosCall({
			url: `/api/system-payouts/${id}/paid`,
			method: 'PATCH',
			data: transferReference ? { transferReference } : {},
		})
	);

const useMarkPayoutFailedMutation = () =>
	useMoneyWrite(({ id, failureReason }) =>
		axiosCall({
			url: `/api/system-payouts/${id}/failed`,
			method: 'PATCH',
			data: { failureReason },
		})
	);

const AdminMoneyServices = {
	disputes: useDisputesQuery,
	refundRequests: useRefundRequestsQuery,
	payoutRequests: usePayoutRequestsQuery,
	payments: usePaymentsQuery,
	systemPayouts: useSystemPayoutsQuery,
	searchJobs: useSearchJobsQuery,
	markPaid: useMarkPayoutPaidMutation,
	markFailed: useMarkPayoutFailedMutation,
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
