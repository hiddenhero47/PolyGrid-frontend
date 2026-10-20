import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Subscription plans — polygrid-backend planRoutes.ts. One plan per tier
// (free | pro | enterprise); `duration` is in days.

// GET /api/plans?includeInactive=true — a plain array, not paginated.
// Public, but includeInactive only matters to the admin plans page.
const useGetPlansQuery = ({ includeInactive = false } = {}) =>
	useQuery({
		queryKey: ['plans', { includeInactive }],
		queryFn: () =>
			axiosCall({
				url: '/api/plans',
				method: 'GET',
				params: includeInactive ? { includeInactive: 'true' } : undefined,
			}),
	});

const useInvalidatePlans = () => {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: ['plans'] });
};

// POST /api/plans { planTier, name, duration, price, currency?,
// privileges?, maxUsers? } — super_admin only; 400 if the tier exists.
const useCreatePlanMutation = () => {
	const invalidate = useInvalidatePlans();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/plans', method: 'POST', data }),
		onSuccess: invalidate,
	});
};

// PUT /api/plans/:id { name?, duration?, price?, currency?, privileges?,
// maxUsers?, isActive? } — super_admin only; the tier can't change.
const useUpdatePlanMutation = () => {
	const invalidate = useInvalidatePlans();
	return useMutation({
		mutationFn: ({ id, ...data }) =>
			axiosCall({ url: `/api/plans/${id}`, method: 'PUT', data }),
		onSuccess: invalidate,
	});
};

const PlanServices = {
	getPlans: useGetPlansQuery,
	createPlan: useCreatePlanMutation,
	updatePlan: useUpdatePlanMutation,
};

export default PlanServices;
