import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// PolyGrid Store, public side (frontend-plan §A.9–A.14) plus the client
// (poster) page (§A.17). Every single view answers the thing, or
// { available: false, message } (unverified / unsubscribed / banned —
// UnavailableState), or 404. All `silent` — the pages show their own
// error states.

const clean = (params) =>
	Object.fromEntries(
		Object.entries(params).filter(([, v]) => v !== '' && v != null)
	);

const get = (url, params) =>
	axiosCall({
		url,
		method: 'GET',
		params: params && clean(params),
		silent: true,
	});

// GET /api/store-profiles?category=&country=&page=&limit= — verified,
// subscribed stores, each with `previewProducts` (matching the category).
const useSearchStoresQuery = (params) =>
	useQuery({
		queryKey: ['stores', params],
		queryFn: () => get('/api/store-profiles', params),
		placeholderData: keepPreviousData,
	});

// GET /api/store-profiles/:idOrSlug?category=&subCategory=&page=&limit=
// → store + { products, pagination }
const useGetStoreQuery = (idOrSlug, params = {}) =>
	useQuery({
		queryKey: ['store', idOrSlug, params],
		queryFn: () =>
			get(`/api/store-profiles/${encodeURIComponent(idOrSlug)}`, params),
		enabled: Boolean(idOrSlug),
		placeholderData: keepPreviousData,
	});

// GET /api/products/:id — one physical product (has storeId, no store)
const useGetProductQuery = (id) =>
	useQuery({
		queryKey: ['product', id],
		queryFn: () => get(`/api/products/${encodeURIComponent(id)}`),
		enabled: Boolean(id),
	});

// GET /api/digital-products/feed?category=&page=&limit= — approved,
// on-sale files from verified, subscribed creators; each with
// creator { id, slug, displayName, avatar }.
const useDigitalFeedQuery = (params) =>
	useQuery({
		queryKey: ['digital-feed', params],
		queryFn: () => get('/api/digital-products/feed', params),
		placeholderData: keepPreviousData,
	});

// GET /api/digital-creator-profiles/:idOrSlug?page=&limit= → creator +
// { products, pagination }
const useGetCreatorQuery = (idOrSlug, params = {}) =>
	useQuery({
		queryKey: ['creator', idOrSlug, params],
		queryFn: () =>
			get(
				`/api/digital-creator-profiles/${encodeURIComponent(idOrSlug)}`,
				params
			),
		enabled: Boolean(idOrSlug),
		placeholderData: keepPreviousData,
	});

// GET /api/digital-products/:id — one approved file (has creatorId)
const useGetDigitalProductQuery = (id) =>
	useQuery({
		queryKey: ['digital-product', id],
		queryFn: () => get(`/api/digital-products/${encodeURIComponent(id)}`),
		enabled: Boolean(id),
	});

// GET /api/client-profiles/:id — a poster's reputation page; never gated
// by verification or plan, only a ban hides it.
const useGetClientQuery = (id) =>
	useQuery({
		queryKey: ['client', id],
		queryFn: () => get(`/api/client-profiles/${encodeURIComponent(id)}`),
		enabled: Boolean(id),
	});

const StoreServices = {
	searchStores: useSearchStoresQuery,
	getStore: useGetStoreQuery,
	getProduct: useGetProductQuery,
	digitalFeed: useDigitalFeedQuery,
	getCreator: useGetCreatorQuery,
	getDigitalProduct: useGetDigitalProductQuery,
	getClient: useGetClientQuery,
};

export default StoreServices;
