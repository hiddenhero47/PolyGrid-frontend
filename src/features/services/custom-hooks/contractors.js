import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// PolyGrid Tenders — direct hire of contractors
// (polygrid-backend contractorProfileRoutes.ts).

// GET /api/contractor-profiles?specialty=&country=&page=&limit=
// Only verified, active, currently-subscribed contractors.
const useSearchContractorsQuery = ({
	specialty,
	country,
	page = 1,
	limit = 12,
}) =>
	useQuery({
		queryKey: ['contractors', { specialty, country, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/contractor-profiles',
				method: 'GET',
				params: {
					specialty: specialty || undefined,
					country: country || undefined,
					page,
					limit,
				},
				silent: true,
			}),
		placeholderData: keepPreviousData,
	});

// GET /api/contractor-profiles/:idOrSlug — the profile, or
// { available: false, message } (banned / unverified / unsubscribed), or 404.
const useGetContractorQuery = (idOrSlug) =>
	useQuery({
		queryKey: ['contractor', idOrSlug],
		queryFn: () =>
			axiosCall({
				url: `/api/contractor-profiles/${encodeURIComponent(idOrSlug)}`,
				method: 'GET',
				silent: true,
			}),
		enabled: Boolean(idOrSlug),
	});

const ContractorServices = {
	search: useSearchContractorsQuery,
	getProfile: useGetContractorQuery,
};

export default ContractorServices;
