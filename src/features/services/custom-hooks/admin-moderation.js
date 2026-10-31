import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Trust & safety in the Admin Dashboard (frontend-plan §C.3, §C.3b, §C.5,
// §C.12): verification templates, message reports, review and profile
// moderation. Every review role can look; changes are admin / super_admin
// (templates are admin / super_admin to view too).

export const MODERATION_KEY = ['admin-moderation'];

const clean = (params) =>
	Object.fromEntries(
		Object.entries(params).filter(([, v]) => v !== '' && v != null)
	);

const useModerationWrite = (request, alsoInvalidate = []) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MODERATION_KEY });
			alsoInvalidate.forEach((queryKey) =>
				queryClient.invalidateQueries({ queryKey })
			);
		},
	});
};

// ── Verification templates ──

// GET /api/verification-templates?profileType=&country=&isActive= → { data }
// — every version, newest first (not paged)
const useTemplatesQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...MODERATION_KEY, 'templates', filters],
		queryFn: () =>
			axiosCall({
				url: '/api/verification-templates',
				method: 'GET',
				params: clean(filters),
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// POST /api/verification-templates { profileType, country, state?, name,
// fields: [...], documents: [...] } — creates the next version for that
// (profileType, country, state) and retires the active one; there is no
// edit
const useCreateTemplateMutation = () =>
	useModerationWrite(
		(data) =>
			axiosCall({ url: '/api/verification-templates', method: 'POST', data }),
		[['verification-template']]
	);

// ── Message reports ──

// GET /api/messages/reports?status=&page= → reports with reportedBy
// ({ fullName, email }) and messageId (the message) populated
const useMessageReportsQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...MODERATION_KEY, 'message-reports', filters],
		queryFn: () =>
			axiosCall({
				url: '/api/messages/reports',
				method: 'GET',
				params: clean(filters),
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// PATCH /api/messages/reports/:id/resolve { redactMessage?, note? } —
// redacting replaces the message text with "[message removed by
// moderator]"; a resolved report can't be resolved again
const useResolveReportMutation = () =>
	useModerationWrite(({ id, redactMessage, note }) =>
		axiosCall({
			url: `/api/messages/reports/${id}/resolve`,
			method: 'PATCH',
			data: { redactMessage: Boolean(redactMessage), ...(note && { note }) },
		})
	);

// ── Reviews ──

// GET /api/reviews/moderation?profileType=&profileId=&isHidden=&page= —
// includes hidden reviews with hiddenBy / hiddenReason / hiddenAt
const useReviewsForModerationQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...MODERATION_KEY, 'reviews', filters],
		queryFn: () =>
			axiosCall({
				url: '/api/reviews/moderation',
				method: 'GET',
				params: clean(filters),
				silent: true,
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// hide (optional reason) backs the rating out of the profile's average;
// unhide puts it back; delete is permanent
const useHideReviewMutation = () =>
	useModerationWrite(
		({ id, reason }) =>
			axiosCall({
				url: `/api/reviews/${id}/hide`,
				method: 'PATCH',
				data: reason ? { reason } : {},
			}),
		[['reviews']]
	);
const useUnhideReviewMutation = () =>
	useModerationWrite(
		(id) => axiosCall({ url: `/api/reviews/${id}/unhide`, method: 'PATCH' }),
		[['reviews']]
	);
const useDeleteReviewMutation = () =>
	useModerationWrite(
		(id) => axiosCall({ url: `/api/reviews/${id}`, method: 'DELETE' }),
		[['reviews']]
	);

// ── Profiles ──

// GET /api/admin/profiles?profileType=&q=&status=&page= — any profile, any
// status (REVIEW_ROLES)
const useProfilesQuery = (filters = {}, options = {}) =>
	useQuery({
		queryKey: [...MODERATION_KEY, 'profiles', filters],
		queryFn: () =>
			axiosCall({
				url: '/api/admin/profiles',
				method: 'GET',
				params: clean(filters),
				silent: true,
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// PATCH /api/admin/profiles/:profileType/:id/status { status: active |
// banned, reason? } — banned hides the public page outright
const useSetProfileStatusMutation = () =>
	useModerationWrite(
		({ profileType, id, status, reason }) =>
			axiosCall({
				url: `/api/admin/profiles/${profileType}/${id}/status`,
				method: 'PATCH',
				data: { status, ...(reason && { reason }) },
			}),
		[['admin-profile'], ['admin-verifications']]
	);

const AdminModerationServices = {
	templates: useTemplatesQuery,
	createTemplate: useCreateTemplateMutation,
	messageReports: useMessageReportsQuery,
	resolveReport: useResolveReportMutation,
	reviews: useReviewsForModerationQuery,
	hideReview: useHideReviewMutation,
	unhideReview: useUnhideReviewMutation,
	deleteReview: useDeleteReviewMutation,
	profiles: useProfilesQuery,
	setProfileStatus: useSetProfileStatusMutation,
};

export default AdminModerationServices;
