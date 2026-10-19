import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// PolyGrid Engineering — polygrid-backend consultancyProfileRoutes.ts

// GET /api/consultancy-profiles?specialization=&country=&page=&limit=
// Only verified, active, currently-subscribed profiles. Returns
// { data: [profile], pagination: { total, page, limit, totalPages } }.
const useSearchConsultantsQuery = ({
	specialization,
	country,
	page = 1,
	limit = 12,
}) =>
	useQuery({
		queryKey: ['consultants', { specialization, country, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/consultancy-profiles',
				method: 'GET',
				params: {
					specialization: specialization || undefined,
					country: country || undefined,
					page,
					limit,
				},
				silent: true,
			}),
		placeholderData: keepPreviousData, // keep the old page on screen while the next loads
	});

// GET /api/consultancy-profiles/:idOrSlug — the profile, or
// { available: false, message } (banned / unsubscribed), or 404.
const useGetConsultantQuery = (idOrSlug) =>
	useQuery({
		queryKey: ['consultant', idOrSlug],
		queryFn: () =>
			axiosCall({
				url: `/api/consultancy-profiles/${encodeURIComponent(idOrSlug)}`,
				method: 'GET',
				silent: true,
			}),
		enabled: Boolean(idOrSlug),
	});

const ConsultancyServices = {
	search: useSearchConsultantsQuery,
	getProfile: useGetConsultantQuery,
};

export default ConsultancyServices;
