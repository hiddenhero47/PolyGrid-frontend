import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// A seller's own products, any state (frontend-plan §B.3d / §B.3e):
// materials-store products and digital-creator files. Lists are the
// owner-only GET <base>/me/products routes; writes answer with the
// changed product, and every write refreshes the list.
//
// Multipart creates / uploads send the non-file fields as one JSON `data`
// field plus the files (the backend's parseMultipartData convention).

const STORE = '/api/store-profiles/me/products';
const CREATOR = '/api/digital-creator-profiles/me/products';

const listKey = (base) => ['my-products', base];

const useMyProductsQuery = (
	base,
	{ page = 1, limit = 12 } = {},
	options = {}
) =>
	useQuery({
		queryKey: [...listKey(base), { page, limit }],
		queryFn: () =>
			axiosCall({ url: base, method: 'GET', params: { page, limit } }),
		placeholderData: keepPreviousData,
		...options,
	});

const useMyStoreProductsQuery = (params, options) =>
	useMyProductsQuery(STORE, params, options);
const useMyDigitalProductsQuery = (params, options) =>
	useMyProductsQuery(CREATOR, params, options);

const useProductWrite = (base, request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey(base) }),
	});
};

const multipart = (fields, filesByField) => {
	const body = new FormData();
	if (fields) body.append('data', JSON.stringify(fields));
	Object.entries(filesByField).forEach(([field, files]) =>
		(files || []).forEach((file) => body.append(field, file))
	);
	return body;
};

// ── Materials store ──

// POST …/me/products — { category (one of the store's), subCategory?,
// title, description?, price, unit, shippingLocations: [{ country,
// state?, price }] } + up to 6 images. May answer with mediaWarnings.
const useCreateStoreProductMutation = () =>
	useProductWrite(STORE, ({ fields, images }) =>
		axiosCall({
			url: STORE,
			method: 'POST',
			data: multipart(fields, { images }),
		})
	);

// PATCH …/me/products/:id — any subset, plus stockStatus
const useUpdateStoreProductMutation = () =>
	useProductWrite(STORE, ({ id, ...data }) =>
		axiosCall({ url: `${STORE}/${id}`, method: 'PATCH', data })
	);

// DELETE …/me/products/:id — the product and its images
const useDeleteStoreProductMutation = () =>
	useProductWrite(STORE, (id) =>
		axiosCall({ url: `${STORE}/${id}`, method: 'DELETE' })
	);

// POST …/me/products/:id/images · DELETE …/images/:fileName
const useAddStoreProductImagesMutation = () =>
	useProductWrite(STORE, ({ id, files }) =>
		axiosCall({
			url: `${STORE}/${id}/images`,
			method: 'POST',
			data: multipart(null, { images: files }),
		})
	);

const useRemoveStoreProductImageMutation = () =>
	useProductWrite(STORE, ({ id, fileName }) =>
		axiosCall({
			url: `${STORE}/${id}/images/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

// ── Digital creator ──

// POST …/me/products — { category, title, description?, price } +
// `previewImages` (public, ≤6) + `files` (private deliverables, 1–10).
// A new product waits for admin review (isVerified false) before it can
// show in the feed.
const useCreateDigitalProductMutation = () =>
	useProductWrite(CREATOR, ({ fields, previewImages, files }) =>
		axiosCall({
			url: CREATOR,
			method: 'POST',
			data: multipart(fields, { previewImages, files }),
		})
	);

// PATCH …/me/products/:id — { category?, title?, description?, price?,
// isActive? }. There's no delete: deactivating is how a product is
// withdrawn, so past buyers keep their downloads.
const useUpdateDigitalProductMutation = () =>
	useProductWrite(CREATOR, ({ id, ...data }) =>
		axiosCall({ url: `${CREATOR}/${id}`, method: 'PATCH', data })
	);

// POST / DELETE …/me/products/:id/preview-images[/:fileName]
const useAddPreviewImagesMutation = () =>
	useProductWrite(CREATOR, ({ id, files }) =>
		axiosCall({
			url: `${CREATOR}/${id}/preview-images`,
			method: 'POST',
			data: multipart(null, { previewImages: files }),
		})
	);

const useRemovePreviewImageMutation = () =>
	useProductWrite(CREATOR, ({ id, fileName }) =>
		axiosCall({
			url: `${CREATOR}/${id}/preview-images/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

// POST / DELETE …/me/products/:id/files[/:fileName] — a removed file is
// kept about a day for purchases already in flight, then deleted.
const useAddDeliverablesMutation = () =>
	useProductWrite(CREATOR, ({ id, files }) =>
		axiosCall({
			url: `${CREATOR}/${id}/files`,
			method: 'POST',
			data: multipart(null, { files }),
		})
	);

const useRemoveDeliverableMutation = () =>
	useProductWrite(CREATOR, ({ id, fileName }) =>
		axiosCall({
			url: `${CREATOR}/${id}/files/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

const ProductServices = {
	myStoreProducts: useMyStoreProductsQuery,
	createStoreProduct: useCreateStoreProductMutation,
	updateStoreProduct: useUpdateStoreProductMutation,
	deleteStoreProduct: useDeleteStoreProductMutation,
	addStoreProductImages: useAddStoreProductImagesMutation,
	removeStoreProductImage: useRemoveStoreProductImageMutation,
	myDigitalProducts: useMyDigitalProductsQuery,
	createDigitalProduct: useCreateDigitalProductMutation,
	updateDigitalProduct: useUpdateDigitalProductMutation,
	addPreviewImages: useAddPreviewImagesMutation,
	removePreviewImage: useRemovePreviewImageMutation,
	addDeliverables: useAddDeliverablesMutation,
	removeDeliverable: useRemoveDeliverableMutation,
};

export default ProductServices;
