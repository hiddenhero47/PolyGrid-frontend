import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// polygrid-backend payoutKycController.ts — the identity check a person
// needs before an admin can approve any refund or payout to them. Two
// tracks, chosen by the backend from the user's country: "automated" (a
// BVN / NIN number checked against the registry, instant) and "document"
// (ID front, ID back and a face photo, reviewed by an admin).

// The backend may answer with the bare record (or null), or with
// { record, track }. Both are read the same way here; with no track the
// document track applies (it's what the backend does for a country with
// no automated provider).
const readMine = (res) => {
	const wrapped = res && typeof res === 'object' && 'record' in res;
	return {
		record: (wrapped ? res.record : res) || null,
		track: (wrapped && res.track) || 'document',
	};
};

// GET /api/users/me/payout-kyc → { record, track }
const useGetMineQuery = (options = {}) =>
	useQuery({
		queryKey: ['my-payout-kyc'],
		queryFn: async () =>
			readMine(
				await axiosCall({ url: '/api/users/me/payout-kyc', method: 'GET' })
			),
		...options,
	});

// POST /api/users/me/payout-kyc, behind the identity check.
// Automated: JSON { idType: 'bvn' | 'nin', idNumber, ...identity }.
// Document: multipart with idFront, idBack, face + the identity fields.
const useSubmitMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ track, idType, idNumber, files = {}, identity = {} }) => {
			if (track === 'automated')
				return axiosCall({
					url: '/api/users/me/payout-kyc',
					method: 'POST',
					data: { idType, idNumber, ...identity },
				});
			const body = new FormData();
			Object.entries(identity).forEach(([key, value]) =>
				body.append(key, value)
			);
			['idFront', 'idBack', 'face'].forEach((type) => {
				if (files[type]) body.append(type, files[type]);
			});
			return axiosCall({
				url: '/api/users/me/payout-kyc',
				method: 'POST',
				data: body,
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['my-payout-kyc'] }),
	});
};

// GET /api/payout-kyc?status=&page=&limit= (REVIEW_ROLES) → { data, pagination }
const useGetRecordsQuery = ({ status, page = 1, limit = 10 }, options = {}) =>
	useQuery({
		queryKey: ['admin-payout-kyc', { status, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/payout-kyc',
				method: 'GET',
				params: { status, page, limit },
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// PATCH /api/payout-kyc/:id/approve | /reject { rejectionReason } —
// admin / super_admin, document-track records that are still pending.
const useDecideMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, approve, rejectionReason }) =>
			axiosCall({
				url: `/api/payout-kyc/${id}/${approve ? 'approve' : 'reject'}`,
				method: 'PATCH',
				data: approve ? {} : { rejectionReason },
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['admin-payout-kyc'] }),
	});
};

const PayoutKycServices = {
	getMine: useGetMineQuery,
	submit: useSubmitMutation,
	getRecords: useGetRecordsQuery,
	decide: useDecideMutation,
};

export default PayoutKycServices;
