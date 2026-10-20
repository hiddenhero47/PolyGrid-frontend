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

// GET /api/reference/countries/:code/cities → { data: [{ name, stateCode }] }
// Used as type-ahead suggestions; the backend accepts any city string.
const useGetCitiesQuery = (countryCode) =>
	useQuery({
		queryKey: ['reference', 'cities', countryCode],
		queryFn: () =>
			axiosCall({
				url: `/api/reference/countries/${countryCode}/cities`,
				method: 'GET',
				silent: true,
			}),
		select: (res) => res?.data ?? [],
		enabled: Boolean(countryCode),
		staleTime: Infinity,
		gcTime: 30 * 60 * 1000,
	});

// GET /api/reference/countries/:code/states → { data: [{ isoCode, name }] }
const useGetStatesQuery = (countryCode) =>
	useQuery({
		queryKey: ['reference', 'states', countryCode],
		queryFn: () =>
			axiosCall({
				url: `/api/reference/countries/${countryCode}/states`,
				method: 'GET',
				silent: true,
			}),
		select: (res) => res?.data ?? [],
		enabled: Boolean(countryCode),
		staleTime: Infinity,
	});

const ReferenceServices = {
	getCountries: useGetCountriesQuery,
	getCities: useGetCitiesQuery,
	getStates: useGetStatesQuery,
};

export default ReferenceServices;
