import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Admin Dashboard (frontend-plan §C) — overview, the verification queue,
// private document links and the user list. Plans and subscriptions have
// their own files.

// GET /api/stats/overview — REVIEW_ROLES. Returns { totalUsers,
// suspendedUsers, activeSubscriptions, completedJobs,
// completedJobsGrossAmount, successfulDigitalPurchases, storeOrders,
// profileCounts: [{ profileType, total, verified }] }.
const useGetOverviewQuery = () =>
	useQuery({
		queryKey: ['admin-overview'],
		queryFn: () => axiosCall({ url: '/api/stats/overview', method: 'GET' }),
		staleTime: 60 * 1000,
	});

// GET /api/verifications?status=&profileType=&page=&limit= — REVIEW_ROLES.
// { data: [verification with user: { _id, fullName, email }], pagination }
const useGetVerificationsQuery = (
	{ status, profileType, page = 1, limit = 10 },
	options = {}
) =>
	useQuery({
		queryKey: ['admin-verifications', { status, profileType, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/verifications',
				method: 'GET',
				params: {
					status: status || undefined,
					profileType: profileType || undefined,
					page,
					limit,
				},
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// Approving or rejecting changes the queue, its counts and the overview's
// verified numbers.
const useReviewInvalidation = () => {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
		queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
	};
};

// PATCH /api/verifications/:id/approve — admin / super_admin; pending only.
// Flips the profile's isVerified.
const useApproveVerificationMutation = () => {
	const invalidate = useReviewInvalidation();
	return useMutation({
		mutationFn: (id) =>
			axiosCall({ url: `/api/verifications/${id}/approve`, method: 'PATCH' }),
		onSuccess: invalidate,
	});
};

// PATCH /api/verifications/:id/reject { reason } — reason required.
const useRejectVerificationMutation = () => {
	const invalidate = useReviewInvalidation();
	return useMutation({
		mutationFn: ({ id, reason }) =>
			axiosCall({
				url: `/api/verifications/${id}/reject`,
				method: 'PATCH',
				data: { reason },
			}),
		onSuccess: invalidate,
	});
};

// GET /api/files/private/:ownerId/:fileName/link — owner, admin /
// super_admin, or customer_care for a verification document. Returns short-lived signed
// { requestUrl, downloadUrl }, so it's fetched on click, never cached.
const useGetFileLinkMutation = () =>
	useMutation({
		mutationFn: ({ ownerId, fileName }) =>
			axiosCall({
				url: `/api/files/private/${ownerId}/${encodeURIComponent(fileName)}/link`,
				method: 'GET',
			}),
	});

// GET /api/users?systemRole=&userId=&q=&page=&limit= — admin / super_admin
// (read only). `q` matches email or full name. { data: [user (lean —
// `_id`, not `id`)], pagination }
const useGetUsersQuery = (
	{ systemRole, userId, q, page = 1, limit = 10 },
	options = {}
) =>
	useQuery({
		queryKey: ['admin-users', { systemRole, userId, q, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/users',
				method: 'GET',
				params: {
					systemRole: systemRole || undefined,
					userId: userId || undefined,
					q: q || undefined,
					page,
					limit,
				},
			}),
		placeholderData: keepPreviousData,
		...options,
	});

const AdminServices = {
	getOverview: useGetOverviewQuery,
	getVerifications: useGetVerificationsQuery,
	approveVerification: useApproveVerificationMutation,
	rejectVerification: useRejectVerificationMutation,
	getFileLink: useGetFileLinkMutation,
	getUsers: useGetUsersQuery,
};

export default AdminServices;
