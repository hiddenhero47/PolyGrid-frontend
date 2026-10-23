import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';
import { JOBS_KEY } from './jobs';

// Store orders (frontend-plan §B.13, polygrid-backend storeOrderRoutes.ts).
// An order is one store's products shipped to one destination; placing
// it creates a Job (the store already confirmed, the buyer confirms and
// funds it) — payment and progress live on that job.

export const ORDERS_KEY = ['store-orders'];

const paged = (url, params) => axiosCall({ url, method: 'GET', params });

// GET /api/store-orders/mine — what I've ordered
const useMyOrdersQuery = ({ page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...ORDERS_KEY, 'mine', { page, limit }],
		queryFn: () => paged('/api/store-orders/mine', { page, limit }),
		placeholderData: keepPreviousData,
	});

// GET /api/store-orders/store — what my store has received (buyer
// populated with { fullName, email }); 404 = no store profile
const useStoreOrdersQuery = ({ page = 1, limit = 12 } = {}) =>
	useQuery({
		queryKey: [...ORDERS_KEY, 'store', { page, limit }],
		queryFn: async () => {
			try {
				return await axiosCall({
					url: '/api/store-orders/store',
					method: 'GET',
					params: { page, limit },
					silent: true,
				});
			} catch (error) {
				if (error?.response?.status === 404)
					return { data: [], pagination: null, noStore: true };
				throw error;
			}
		},
		placeholderData: keepPreviousData,
	});

// POST /api/store-orders { storeId, items: [{ productId, quantity }],
// shippingDestination: { country, state? }, note? } → order + `job`.
// A line that can't ship there fails the whole order with
// "<title> does not ship to the requested destination".
const useCreateOrderMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({
				url: '/api/store-orders',
				method: 'POST',
				data,
				silent: true,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
			queryClient.invalidateQueries({ queryKey: JOBS_KEY });
		},
	});
};

const OrderServices = {
	mine: useMyOrdersQuery,
	store: useStoreOrdersQuery,
	create: useCreateOrderMutation,
};

export default OrderServices;
