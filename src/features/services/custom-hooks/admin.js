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

// GET /api/admin/profiles/:profileType/:id — REVIEW_ROLES, read-only.
// Any profile in full, whatever its public state (unverified,
// unsubscribed, banned) — what a reviewer needs before approving it.
// Same shape as that pillar's public profile, without the avatar fallback.
const useGetProfileForReviewQuery = ({ profileType, id }) =>
	useQuery({
		queryKey: ['admin-profile', profileType, id],
		queryFn: () =>
			axiosCall({
				url: `/api/admin/profiles/${profileType}/${id}`,
				method: 'GET',
			}),
		enabled: Boolean(profileType && id),
	});

// User management (frontend-plan §C.2) — super_admin only. Nobody can
// change their own role / status, or the Super Admin's.
const useUserWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
		},
	});
};

// POST /api/users/admin-create { fullName, email, password } — always
// creates an `admin`; another role is a role change straight after.
const useCreateStaffMutation = () =>
	useUserWrite(async ({ role, ...data }) => {
		const created = await axiosCall({
			url: '/api/users/admin-create',
			method: 'POST',
			data,
		});
		if (role && role !== created.systemRole) {
			await axiosCall({
				url: `/api/users/${created.id}/role`,
				method: 'PATCH',
				data: { systemRole: role },
			});
		}
		return created;
	});

// PATCH /api/users/:id/role { systemRole }
const useChangeRoleMutation = () =>
	useUserWrite(({ id, systemRole }) =>
		axiosCall({
			url: `/api/users/${id}/role`,
			method: 'PATCH',
			data: { systemRole },
		})
	);

// PATCH /api/users/:id/account-status { accountStatus: 'active' | 'suspended' }
const useSetAccountStatusMutation = () =>
	useUserWrite(({ id, accountStatus }) =>
		axiosCall({
			url: `/api/users/${id}/account-status`,
			method: 'PATCH',
			data: { accountStatus },
		})
	);

// Digital product review (frontend-plan §C.6) — REVIEW_ROLES, and the one
// queue customer_care can act on.
// GET /api/digital-products/review?status=pending|approved&page=&limit=
// → { data: [product + files (names/sizes) + creator { id, displayName,
//   slug, isVerified, status, country }], pagination }
const useGetDigitalReviewQuery = (
	{ status = 'pending', page = 1, limit = 10 },
	options = {}
) =>
	useQuery({
		queryKey: ['admin-digital-review', { status, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/digital-products/review',
				method: 'GET',
				params: { status, page, limit },
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// PATCH /api/digital-products/:id/verify { isVerified } — approve, or
// revoke an approval (takes it out of the feed).
const useSetDigitalVerificationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, isVerified }) =>
			axiosCall({
				url: `/api/digital-products/${id}/verify`,
				method: 'PATCH',
				data: { isVerified },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-digital-review'] });
			queryClient.invalidateQueries({ queryKey: ['digital-feed'] });
		},
	});
};

// GET /api/digital-products/:id/download — reviewers (and the owner) get
// short-lived signed links: { files: [{ fileName, mime, size,
// downloadUrl }] }. Fetched on click, never cached.
const useGetDeliverableLinksMutation = () =>
	useMutation({
		mutationFn: (id) =>
			axiosCall({ url: `/api/digital-products/${id}/download`, method: 'GET' }),
	});

const AdminServices = {
	getDeliverableLinks: useGetDeliverableLinksMutation,
	getDigitalReview: useGetDigitalReviewQuery,
	setDigitalVerification: useSetDigitalVerificationMutation,
	createStaff: useCreateStaffMutation,
	changeRole: useChangeRoleMutation,
	setAccountStatus: useSetAccountStatusMutation,
	getProfileForReview: useGetProfileForReviewQuery,
	getOverview: useGetOverviewQuery,
	getVerifications: useGetVerificationsQuery,
	approveVerification: useApproveVerificationMutation,
	rejectVerification: useRejectVerificationMutation,
	getFileLink: useGetFileLinkMutation,
	getUsers: useGetUsersQuery,
};

export default AdminServices;
