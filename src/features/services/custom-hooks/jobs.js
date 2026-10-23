import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Jobs — the cross-pillar escrow / trust record between a client and a
// provider (frontend-plan §B.6, polygrid-backend jobRoutes.ts). Stage
// `payment` is a percentage of totalAmount (all stages ≤ 100%). Every
// write answers with the updated job.

export const JOBS_KEY = ['jobs'];
export const jobKey = (id) => [...JOBS_KEY, 'one', id];

// GET /api/jobs/mine?status=&page=&limit= → { data: [summary], pagination }
const useMyJobsQuery = ({ status, page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...JOBS_KEY, 'mine', { status, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/jobs/mine',
				method: 'GET',
				params: { status: status || undefined, page, limit },
			}),
		placeholderData: keepPreviousData,
	});

// GET /api/jobs/:id — the full job (parties' contract files come with
// short-lived requestUrl / downloadUrl)
const useJobQuery = (id) =>
	useQuery({
		queryKey: jobKey(id),
		queryFn: () =>
			axiosCall({ url: `/api/jobs/${id}`, method: 'GET', silent: true }),
		enabled: Boolean(id),
	});

// A write answers with the bare job — no party names or contract links —
// so those are kept from the cached copy until the refetch brings fresh
// ones.
const keepPartyExtras = (old, party) => ({
	...party,
	user: old?.user,
	contractFile: party?.contractFile && {
		...party.contractFile,
		requestUrl: old?.contractFile?.requestUrl,
		downloadUrl: old?.contractFile?.downloadUrl,
	},
});

// Every write replaces the cached job, then refreshes it and the lists.
const useJobWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: (job) => {
			if (job?._id)
				queryClient.setQueryData(jobKey(job._id), (old) => ({
					...old,
					...job,
					client: keepPartyExtras(old?.client, job.client),
					provider: keepPartyExtras(old?.provider, job.provider),
				}));
			queryClient.invalidateQueries({ queryKey: JOBS_KEY });
		},
	});
};

const patch = (url, data) => axiosCall({ url, method: 'PATCH', data });
const post = (url, data) => axiosCall({ url, method: 'POST', data });

// POST /api/jobs { counterpartyUserId, myRole: client|provider, jobTitle,
// jobDescription, totalAmount, currency?, jobType?, stages? }
const useCreateJobMutation = () =>
	useJobWrite((data) => post('/api/jobs', data));

// PATCH /api/jobs/:id — the creator, before confirmation
const useUpdateJobMutation = () =>
	useJobWrite(({ id, ...data }) => patch(`/api/jobs/${id}`, data));

// PATCH /api/jobs/:id/confirm — each party once; both → active
const useConfirmJobMutation = () =>
	useJobWrite((id) => patch(`/api/jobs/${id}/confirm`));

// PATCH /api/jobs/:id/cancel — the creator, before confirmation
const useCancelJobMutation = () =>
	useJobWrite((id) => patch(`/api/jobs/${id}/cancel`));

// stage changes on an active job: one side proposes, the other decides
const useProposeStagesMutation = () =>
	useJobWrite(({ id, stages }) =>
		post(`/api/jobs/${id}/stages/propose`, { stages })
	);

const useAcceptStagesMutation = () =>
	useJobWrite((id) => patch(`/api/jobs/${id}/stages/accept`));

const useRejectStagesMutation = () =>
	useJobWrite((id) => patch(`/api/jobs/${id}/stages/reject`));

// provider marks a stage done → client verifies it (releases its share)
const useStageDoneMutation = () =>
	useJobWrite(({ id, stageId }) =>
		patch(`/api/jobs/${id}/stages/${stageId}/done`)
	);

const useStageVerifyMutation = () =>
	useJobWrite(({ id, stageId }) =>
		patch(`/api/jobs/${id}/stages/${stageId}/verify`)
	);

// POST /api/jobs/:id/contract — multipart, one PDF or DOCX
const useUploadContractMutation = () =>
	useJobWrite(({ id, file }) => {
		const body = new FormData();
		body.append('contract', file);
		return post(`/api/jobs/${id}/contract`, body);
	});

// PATCH /api/jobs/:id/dispute { reason }
const useDisputeMutation = () =>
	useJobWrite(({ id, reason }) => patch(`/api/jobs/${id}/dispute`, { reason }));

// refund (client) / payout (provider) requests: a reason / note only —
// the backend works out the amount
const useRequestRefundMutation = () =>
	useJobWrite(({ id, reason }) =>
		post(`/api/jobs/${id}/refund-requests`, { reason })
	);

const useRequestPayoutMutation = () =>
	useJobWrite(({ id, note }) =>
		post(`/api/jobs/${id}/payout-requests`, note ? { note } : {})
	);

const JobServices = {
	mine: useMyJobsQuery,
	get: useJobQuery,
	create: useCreateJobMutation,
	update: useUpdateJobMutation,
	confirm: useConfirmJobMutation,
	cancel: useCancelJobMutation,
	proposeStages: useProposeStagesMutation,
	acceptStages: useAcceptStagesMutation,
	rejectStages: useRejectStagesMutation,
	stageDone: useStageDoneMutation,
	stageVerify: useStageVerifyMutation,
	uploadContract: useUploadContractMutation,
	dispute: useDisputeMutation,
	requestRefund: useRequestRefundMutation,
	requestPayout: useRequestPayoutMutation,
};

export default JobServices;
