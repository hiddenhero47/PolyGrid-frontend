import { useQuery } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Public, no-auth marketing numbers. All `silent`: if the backend is down
// the page just hides these, it shouldn't pop error toasts at a visitor.

// GET /api/stats/top-profiles — verified + subscribed profiles of one
// type, best rated first. Returns { profileType, data: [{ id, ratingAverage,
// ratingCount, headline, displayName, storeName, slug, country }] }.
const useGetTopProfilesQuery = ({ profileType, limit = 4 }) =>
	useQuery({
		queryKey: ['top-profiles', profileType, limit],
		queryFn: () =>
			axiosCall({
				url: '/api/stats/top-profiles',
				method: 'GET',
				params: { profileType, limit },
				silent: true,
			}),
		enabled: Boolean(profileType),
		staleTime: 5 * 60 * 1000,
	});

// GET /api/tender-projects/public-summary and
// GET /api/job-openings/public-summary — counts only, never listings
// (frontend-plan §A.18 / §A.19). Each returns { totalOpen, byCategory }.
const usePublicSummaryQuery = (resource) =>
	useQuery({
		queryKey: ['public-summary', resource],
		queryFn: () =>
			axiosCall({
				url: `/api/${resource}/public-summary`,
				method: 'GET',
				silent: true,
			}),
		staleTime: 5 * 60 * 1000,
	});

const useGetTenderSummaryQuery = () => usePublicSummaryQuery('tender-projects');
const useGetJobOpeningSummaryQuery = () =>
	usePublicSummaryQuery('job-openings');

const StatsServices = {
	getTopProfiles: useGetTopProfilesQuery,
	getTenderSummary: useGetTenderSummaryQuery,
	getJobOpeningSummary: useGetJobOpeningSummaryQuery,
};

export default StatsServices;
