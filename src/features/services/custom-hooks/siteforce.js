import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// PolyGrid SiteForce, dashboard side (frontend-plan §B.10–B.12,
// polygrid-backend jobOpeningRoutes.ts). Posting needs a verified,
// subscribed client profile (402); the board, detail and applying need a
// verified, subscribed worker profile (403 / `{ available: false }`).
// Detail is two-tier: the exact location, contact and files only come
// back for the poster, an admin, or a worker whose application was
// accepted.

export const SITEFORCE_KEY = ['siteforce'];
const openingKey = (id) => [...SITEFORCE_KEY, 'opening', id];
const BASE = '/api/job-openings';

const multipart = (fields, files = []) => {
	const body = new FormData();
	if (fields) body.append('data', JSON.stringify(fields));
	files.forEach((file) => body.append('files', file));
	return body;
};

// GET /api/job-openings?category=&country=&page= — or near a point with
// lat/lng/radiusKm (then each row has distanceKm, nearest first)
const useBoardQuery = ({
	category,
	country,
	lat,
	lng,
	radiusKm,
	page = 1,
	limit = 12,
} = {}) =>
	useQuery({
		queryKey: [
			...SITEFORCE_KEY,
			'board',
			{ category, country, lat, lng, radiusKm, page, limit },
		],
		queryFn: () =>
			axiosCall({
				url: BASE,
				method: 'GET',
				params: {
					category: category || undefined,
					country: country || undefined,
					lat: lat ?? undefined,
					lng: lng ?? undefined,
					radiusKm: lat != null ? radiusKm : undefined,
					page,
					limit,
				},
				silent: true,
			}),
		placeholderData: keepPreviousData,
		retry: (count, error) => error?.response?.status !== 403 && count < 2,
	});

// GET /api/job-openings/me — everything I've posted, any status
const useMyOpeningsQuery = ({ page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...SITEFORCE_KEY, 'mine', { page, limit }],
		queryFn: () =>
			axiosCall({ url: `${BASE}/me`, method: 'GET', params: { page, limit } }),
		placeholderData: keepPreviousData,
	});

// GET /api/job-openings/applications/mine (404 = no worker profile yet)
const useMyApplicationsQuery = ({ page = 1, limit = 20 } = {}, options = {}) =>
	useQuery({
		queryKey: [...SITEFORCE_KEY, 'applications', { page, limit }],
		queryFn: async () => {
			try {
				return await axiosCall({
					url: `${BASE}/applications/mine`,
					method: 'GET',
					params: { page, limit },
					silent: true,
				});
			} catch (error) {
				if (error?.response?.status === 404)
					return { data: [], pagination: null, noProfile: true };
				throw error;
			}
		},
		placeholderData: keepPreviousData,
		...options,
	});

const useOpeningQuery = (id, options = {}) =>
	useQuery({
		queryKey: openingKey(id),
		queryFn: () =>
			axiosCall({ url: `${BASE}/${id}`, method: 'GET', silent: true }),
		enabled: Boolean(id),
		...options,
	});

// GET …/:id/applications — poster only; worker / applicant populated
const useOpeningApplicationsQuery = (id, options = {}) =>
	useQuery({
		queryKey: [...openingKey(id), 'applications'],
		queryFn: () =>
			axiosCall({ url: `${BASE}/${id}/applications`, method: 'GET' }),
		enabled: Boolean(id),
		...options,
	});

const useSiteForceWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: SITEFORCE_KEY }),
	});
};

// POST /api/job-openings — multipart: `data` = { title, description,
// category, workersNeeded?, payRate, payType, currency, employmentType,
// generalArea: { country, state?, city? }, coordinates?: { lat, lng },
// address?, googleMapsUrl?, contactInfo?, applicationDeadline? } + up to
// 5 files
const useCreateOpeningMutation = () =>
	useSiteForceWrite(({ fields, files }) =>
		axiosCall({ url: BASE, method: 'POST', data: multipart(fields, files) })
	);

const useUpdateOpeningMutation = () =>
	useSiteForceWrite(({ id, ...data }) =>
		axiosCall({ url: `${BASE}/${id}`, method: 'PATCH', data })
	);

const useAddOpeningFilesMutation = () =>
	useSiteForceWrite(({ id, files }) =>
		axiosCall({
			url: `${BASE}/${id}/files`,
			method: 'POST',
			data: multipart(null, files),
		})
	);

const useRemoveOpeningFileMutation = () =>
	useSiteForceWrite(({ id, fileName }) =>
		axiosCall({
			url: `${BASE}/${id}/files/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

const useCancelOpeningMutation = () =>
	useSiteForceWrite((id) =>
		axiosCall({ url: `${BASE}/${id}/cancel`, method: 'PATCH' })
	);

// worker: { message? }
const useApplyMutation = () =>
	useSiteForceWrite(({ id, message }) =>
		axiosCall({
			url: `${BASE}/${id}/applications`,
			method: 'POST',
			data: message ? { message } : {},
		})
	);

const useUpdateApplicationMutation = () =>
	useSiteForceWrite(({ id, message }) =>
		axiosCall({
			url: `${BASE}/${id}/applications/mine`,
			method: 'PATCH',
			data: { message },
		})
	);

const useWithdrawApplicationMutation = () =>
	useSiteForceWrite((id) =>
		axiosCall({
			url: `${BASE}/${id}/applications/mine/withdraw`,
			method: 'PATCH',
		})
	);

// poster: accept creates the Job (answer carries `job`); once the worker
// count is met the opening fills and the other pending ones are rejected
const useAcceptApplicationMutation = () =>
	useSiteForceWrite(({ id, applicationId }) =>
		axiosCall({
			url: `${BASE}/${id}/applications/${applicationId}/accept`,
			method: 'PATCH',
		})
	);

const useRejectApplicationMutation = () =>
	useSiteForceWrite(({ id, applicationId }) =>
		axiosCall({
			url: `${BASE}/${id}/applications/${applicationId}/reject`,
			method: 'PATCH',
		})
	);

const SiteForceServices = {
	board: useBoardQuery,
	mine: useMyOpeningsQuery,
	myApplications: useMyApplicationsQuery,
	get: useOpeningQuery,
	applications: useOpeningApplicationsQuery,
	create: useCreateOpeningMutation,
	update: useUpdateOpeningMutation,
	addFiles: useAddOpeningFilesMutation,
	removeFile: useRemoveOpeningFileMutation,
	cancel: useCancelOpeningMutation,
	apply: useApplyMutation,
	updateApplication: useUpdateApplicationMutation,
	withdrawApplication: useWithdrawApplicationMutation,
	accept: useAcceptApplicationMutation,
	reject: useRejectApplicationMutation,
};

export default SiteForceServices;
