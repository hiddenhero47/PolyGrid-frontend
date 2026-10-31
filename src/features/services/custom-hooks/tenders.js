import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// PolyGrid Tenders, dashboard side (frontend-plan §B.7–B.9,
// polygrid-backend tenderProjectRoutes.ts). Posting needs a verified,
// subscribed client profile (402 otherwise); the board, project detail
// and bidding need a verified, subscribed contractor profile (403, or
// `{ available: false }` on detail). Bids are sealed: only the poster
// sees them all.

export const TENDERS_KEY = ['tenders'];
const projectKey = (id) => [...TENDERS_KEY, 'project', id];
const BASE = '/api/tender-projects';

const multipart = (fields, files = []) => {
	const body = new FormData();
	if (fields) body.append('data', JSON.stringify(fields));
	files.forEach((file) => body.append('files', file));
	return body;
};

// GET /api/tender-projects?category=&country=&page= — open projects
// (eligible contractors only; 403 is the "not eligible" signal)
const useBoardQuery = ({ category, country, page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...TENDERS_KEY, 'board', { category, country, page, limit }],
		queryFn: () =>
			axiosCall({
				url: BASE,
				method: 'GET',
				params: {
					category: category || undefined,
					country: country || undefined,
					page,
					limit,
				},
				silent: true,
			}),
		placeholderData: keepPreviousData,
		retry: (count, error) => error?.response?.status !== 403 && count < 2,
	});

// GET /api/tender-projects/me — everything I've posted, any status
const useMyProjectsQuery = ({ page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...TENDERS_KEY, 'mine', { page, limit }],
		queryFn: () =>
			axiosCall({ url: `${BASE}/me`, method: 'GET', params: { page, limit } }),
		placeholderData: keepPreviousData,
	});

// GET /api/tender-projects/bids/mine — my bids across every project
// (404 = no contractor profile yet → treated as "no bids")
const useMyBidsQuery = ({ page = 1, limit = 20 } = {}, options = {}) =>
	useQuery({
		queryKey: [...TENDERS_KEY, 'bids', { page, limit }],
		queryFn: async () => {
			try {
				return await axiosCall({
					url: `${BASE}/bids/mine`,
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

// GET /api/tender-projects/:id — full detail + signed file links, or
// { available: false } when you're not allowed to see it
const useProjectQuery = (id, options = {}) =>
	useQuery({
		queryKey: projectKey(id),
		queryFn: () =>
			axiosCall({ url: `${BASE}/${id}`, method: 'GET', silent: true }),
		enabled: Boolean(id),
		...options,
	});

// GET /api/tender-projects/:id/bids — poster only; contractor and bidder
// come populated ({ headline, slug, rating… } / { fullName })
const useProjectBidsQuery = (id, options = {}) =>
	useQuery({
		queryKey: [...projectKey(id), 'bids'],
		queryFn: () => axiosCall({ url: `${BASE}/${id}/bids`, method: 'GET' }),
		enabled: Boolean(id),
		...options,
	});

const useTenderWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: TENDERS_KEY }),
	});
};

// POST /api/tender-projects — multipart: `data` = { title, description,
// category, budgetMin?, budgetMax?, currency, location: { country,
// state? }, bidDeadline } + up to 10 files
const useCreateProjectMutation = () =>
	useTenderWrite(({ fields, files }) =>
		axiosCall({ url: BASE, method: 'POST', data: multipart(fields, files) })
	);

// PATCH /api/tender-projects/:id — while open
const useUpdateProjectMutation = () =>
	useTenderWrite(({ id, ...data }) =>
		axiosCall({ url: `${BASE}/${id}`, method: 'PATCH', data })
	);

const useAddProjectFilesMutation = () =>
	useTenderWrite(({ id, files }) =>
		axiosCall({
			url: `${BASE}/${id}/files`,
			method: 'POST',
			data: multipart(null, files),
		})
	);

const useRemoveProjectFileMutation = () =>
	useTenderWrite(({ id, fileName }) =>
		axiosCall({
			url: `${BASE}/${id}/files/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

// PATCH …/cancel — pending bids are rejected with it
const useCancelProjectMutation = () =>
	useTenderWrite((id) =>
		axiosCall({ url: `${BASE}/${id}/cancel`, method: 'PATCH' })
	);

// PATCH …/award { bidId } — rejects every other pending bid and creates
// the Job (answer carries `job`)
const useAwardMutation = () =>
	useTenderWrite(({ id, bidId }) =>
		axiosCall({ url: `${BASE}/${id}/award`, method: 'PATCH', data: { bidId } })
	);

// bids: { amount, currency, proposal, estimatedDurationDays? }
const useSubmitBidMutation = () =>
	useTenderWrite(({ id, ...data }) =>
		axiosCall({ url: `${BASE}/${id}/bids`, method: 'POST', data })
	);

const useUpdateBidMutation = () =>
	useTenderWrite(({ id, ...data }) =>
		axiosCall({ url: `${BASE}/${id}/bids/mine`, method: 'PATCH', data })
	);

const useWithdrawBidMutation = () =>
	useTenderWrite((id) =>
		axiosCall({ url: `${BASE}/${id}/bids/mine/withdraw`, method: 'PATCH' })
	);

const TenderServices = {
	board: useBoardQuery,
	mine: useMyProjectsQuery,
	myBids: useMyBidsQuery,
	get: useProjectQuery,
	bids: useProjectBidsQuery,
	create: useCreateProjectMutation,
	update: useUpdateProjectMutation,
	addFiles: useAddProjectFilesMutation,
	removeFile: useRemoveProjectFileMutation,
	cancel: useCancelProjectMutation,
	award: useAwardMutation,
	submitBid: useSubmitBidMutation,
	updateBid: useUpdateBidMutation,
	withdrawBid: useWithdrawBidMutation,
};

export default TenderServices;
