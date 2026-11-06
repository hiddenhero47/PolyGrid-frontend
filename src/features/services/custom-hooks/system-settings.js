import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// polygrid-backend systemSettingsRoutes.ts — the one settings record: what
// the platform will take in payments. Amounts are USD.

// GET /api/system-settings (REVIEW_ROLES)
const useGetSettingsQuery = () =>
	useQuery({
		queryKey: ['system-settings'],
		queryFn: () => axiosCall({ url: '/api/system-settings', method: 'GET' }),
	});

// PATCH /api/system-settings (super admin) — any of maxTransactionAmount,
// maxOutstandingExposure, supportedCountries, fraudHoldThresholdAmount,
// fraudHoldHours, manualReviewThresholdAmount.
const useUpdateSettingsMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/system-settings', method: 'PATCH', data }),
		onSuccess: (res) => queryClient.setQueryData(['system-settings'], res),
	});
};

const SystemSettingsServices = {
	get: useGetSettingsQuery,
	update: useUpdateSettingsMutation,
};

export default SystemSettingsServices;
