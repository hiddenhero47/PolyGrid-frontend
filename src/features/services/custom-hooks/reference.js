import { useQuery } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Static reference data (frontend-plan §2): country / state / city /
// currency lists always come from the backend, so a dropdown can only
// offer values the backend will accept. Never changes at runtime, so it's
// fetched once per session.

// GET /api/reference/countries → { data: [{ isoCode, name, currency, phonecode }] }
const useGetCountriesQuery = () =>
	useQuery({
		queryKey: ['reference', 'countries'],
		queryFn: () =>
			axiosCall({
				url: '/api/reference/countries',
				method: 'GET',
				silent: true,
			}),
		select: (res) => res?.data ?? [],
		staleTime: Infinity,
		gcTime: Infinity,
	});

const ReferenceServices = {
	getCountries: useGetCountriesQuery,
};

export default ReferenceServices;
