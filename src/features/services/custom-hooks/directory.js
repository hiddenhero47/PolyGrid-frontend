import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Public business-profile directories — contractors (PolyGrid Tenders)
// and SiteForce workers — which share one shape:
//   GET <base>?<filter>=&country=&page=&limit=  → { data, pagination }
//       only verified, active, currently-subscribed profiles
//   GET <base>/:idOrSlug → profile | { available: false, message } | 404
// `base` is the API path, e.g. '/api/contractor-profiles'.

const useSearchDirectoryQuery = (base, params) =>
	useQuery({
		queryKey: ['directory', base, params],
		queryFn: () =>
			axiosCall({
				url: base,
				method: 'GET',
				params: Object.fromEntries(
					Object.entries(params).filter(
						([, value]) => value !== '' && value != null
					)
				),
				silent: true,
			}),
		placeholderData: keepPreviousData,
	});

const useGetDirectoryProfileQuery = (base, idOrSlug) =>
	useQuery({
		queryKey: ['directory-profile', base, idOrSlug],
		queryFn: () =>
			axiosCall({
				url: `${base}/${encodeURIComponent(idOrSlug)}`,
				method: 'GET',
				silent: true,
			}),
		enabled: Boolean(idOrSlug),
	});

const DirectoryServices = {
	search: useSearchDirectoryQuery,
	getProfile: useGetDirectoryProfileQuery,
};

export default DirectoryServices;
