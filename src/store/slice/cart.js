import { createSelector, createSlice } from '@reduxjs/toolkit';

// The materials cart (frontend-plan §B.13). An order is one store's
// products shipped to one place, so the cart is kept per store:
//   stores: { [storeId]: { storeId, storeName, slug, items: [{ productId,
//     title, price, currency, unit, image, shippingLocations, quantity }] } }
// Prices and delivery areas are copies for showing totals; the backend
// re-reads every product when the order is placed.
const initialState = { stores: {} };

const MAX_QUANTITY = 9999;
const clamp = (n) =>
	Math.min(Math.max(Math.round(Number(n) || 1), 1), MAX_QUANTITY);

export const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		addToCart: (state, { payload: { store, product, quantity = 1 } }) => {
			const storeId = String(store.id);
			const entry = (state.stores[storeId] ||= {
				storeId,
				storeName: store.storeName,
				slug: store.slug,
				items: [],
			});
			const existing = entry.items.find((i) => i.productId === product.id);
			if (existing) {
				existing.quantity = clamp(existing.quantity + quantity);
				Object.assign(existing, {
					price: product.price,
					shippingLocations: product.shippingLocations || [],
				});
				return;
			}
			entry.items.push({
				productId: product.id,
				title: product.title,
				price: product.price,
				currency: product.currency,
				unit: product.unit,
				image: product.images?.[0]?.url || '',
				shippingLocations: product.shippingLocations || [],
				quantity: clamp(quantity),
			});
		},
		setCartQuantity: (state, { payload: { storeId, productId, quantity } }) => {
			const item = state.stores[storeId]?.items.find(
				(i) => i.productId === productId
			);
			if (item) item.quantity = clamp(quantity);
		},
		removeFromCart: (state, { payload: { storeId, productId } }) => {
			const entry = state.stores[storeId];
			if (!entry) return;
			entry.items = entry.items.filter((i) => i.productId !== productId);
			if (!entry.items.length) delete state.stores[storeId];
		},
		clearCartStore: (state, { payload: storeId }) => {
			delete state.stores[storeId];
		},
	},
});

export const { addToCart, setCartQuantity, removeFromCart, clearCartStore } =
	cartSlice.actions;

const selectStoresMap = (state) => state.cart?.stores;
export const selectCartStores = createSelector([selectStoresMap], (stores) =>
	Object.values(stores || {})
);
export const selectCartStore = (storeId) => (state) =>
	state.cart?.stores?.[storeId] || null;
export const selectCartCount = (state) =>
	Object.values(state.cart?.stores || {}).reduce(
		(n, s) => n + s.items.length,
		0
	);

// Delivery price for one line — polygrid-backend productModel.ts
// resolveShippingPrice: a state row wins, else the country-wide row,
// else it doesn't deliver there (null). Charged once per line.
export const lineShipping = (item, destination) => {
	if (!destination?.country) return undefined;
	const rows = item.shippingLocations || [];
	if (destination.state) {
		const exact = rows.find(
			(r) => r.country === destination.country && r.state === destination.state
		);
		if (exact) return exact.price;
	}
	const nationwide = rows.find(
		(r) => r.country === destination.country && !r.state
	);
	return nationwide ? nationwide.price : null;
};

export default cartSlice.reducer;
