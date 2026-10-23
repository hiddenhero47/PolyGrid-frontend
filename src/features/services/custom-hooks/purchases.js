import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Digital purchases (frontend-plan §B.14): bought straight through
// Stripe — no job, no escrow. The webhook (or /payments/:id/refresh)
// marks the purchase `success`, then the buyer's own copy can be
// downloaded.

export const PURCHASES_KEY = ['digital-purchases'];

// GET /api/digital-purchases/mine → { data: [{ id, product: { title,
// category, previewImages } (live — can be gone), priceSnapshot,
// currency, status: pending|success, createdAt }], pagination }
const useMyPurchasesQuery = ({ page = 1, limit = 12 } = {}, options = {}) =>
	useQuery({
		queryKey: [...PURCHASES_KEY, 'mine', { page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/digital-purchases/mine',
				method: 'GET',
				params: { page, limit },
			}),
		placeholderData: keepPreviousData,
		...options,
	});

// POST /api/payments/intent { targetType: 'DigitalPurchase', targetId }
// → { clientSecret, paymentId, purchaseId }. 400 if it's yours, already
// owned, or a purchase is still pending.
const useBuyMutation = () =>
	useMutation({
		mutationFn: (productId) =>
			axiosCall({
				url: '/api/payments/intent',
				method: 'POST',
				data: { targetType: 'DigitalPurchase', targetId: productId },
			}),
	});

// GET /api/digital-purchases/:id/download → { files: [{ fileName, mime,
// size, downloadUrl }] }. Expected non-errors: 410 (retention ended —
// the buyer's subscription lapsed a while back), 503 (still being
// prepared), 403 (not paid yet).
const useDownloadLinksMutation = () =>
	useMutation({
		mutationFn: (purchaseId) =>
			axiosCall({
				url: `/api/digital-purchases/${purchaseId}/download`,
				method: 'GET',
				silent: true,
			}),
	});

const useRefreshPurchases = () => {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
};

const PurchaseServices = {
	mine: useMyPurchasesQuery,
	buy: useBuyMutation,
	downloadLinks: useDownloadLinksMutation,
	useRefresh: useRefreshPurchases,
};

export default PurchaseServices;
