import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LuMinus, LuPlus, LuShoppingCart, LuArrowRight } from 'react-icons/lu';
import { addToCart, selectCartStore } from '../../../store/slice/cart';
import { toast } from '../../../layouts/toast/toast-handler';
import { AppButton } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';

// Quantity + "Add to order" on a product page (frontend-plan §B.13).
// The cart is per store; checkout happens in the dashboard.
function AddToCart({ product, store }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [quantity, setQuantity] = useState(1);
	const entry = useSelector(selectCartStore(String(store.id)));
	const inCart = entry?.items.find((i) => i.productId === product.id);
	const soldOut = product.stockStatus === 'out_of_stock';
	const checkoutTo = `${ROUTES.DASHBOARD_ORDERS}/checkout/${store.id}`;

	const step = (delta) =>
		setQuantity((q) => Math.min(Math.max(q + delta, 1), 9999));

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<div
					role="group"
					aria-label="Quantity"
					className="inline-flex h-[46px] items-center rounded-xl border border-(--pg-form-border) bg-(--pg-form-background)"
				>
					<button
						type="button"
						aria-label="One less"
						onClick={() => step(-1)}
						disabled={quantity <= 1 || soldOut}
						className="inline-flex h-full w-11 items-center justify-center text-(--pg-text-secondary) hover:text-(--pg-text-primary) disabled:opacity-40"
					>
						<LuMinus aria-hidden="true" />
					</button>
					<input
						type="number"
						inputMode="numeric"
						min="1"
						aria-label={`Quantity (${product.unit})`}
						value={quantity}
						disabled={soldOut}
						onChange={(e) =>
							setQuantity(
								Math.min(Math.max(Number(e.target.value) || 1, 1), 9999)
							)
						}
						className="h-full w-16 [appearance:textfield] bg-transparent text-center font-semibold text-(--pg-text-primary) outline-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
					<button
						type="button"
						aria-label="One more"
						onClick={() => step(1)}
						disabled={soldOut}
						className="inline-flex h-full w-11 items-center justify-center text-(--pg-text-secondary) hover:text-(--pg-text-primary) disabled:opacity-40"
					>
						<LuPlus aria-hidden="true" />
					</button>
				</div>
				<AppButton
					icon={<LuShoppingCart />}
					disabled={soldOut}
					onClick={() => {
						dispatch(addToCart({ store, product, quantity }));
						toast.success(`${quantity} × ${product.title} added`, {
							actionText: 'Check out',
							onAction: () => navigate(checkoutTo),
						});
						setQuantity(1);
					}}
				>
					{soldOut ? 'Out of stock' : 'Add to order'}
				</AppButton>
			</div>
			{entry && (
				<AppButton variant="secondary" to={checkoutTo} icon={<LuArrowRight />}>
					Check out · {entry.items.length} item
					{entry.items.length === 1 ? '' : 's'}
					{inCart ? ` (${inCart.quantity} of this)` : ''}
				</AppButton>
			)}
			<span className="text-sm text-(--pg-text-secondary)">
				Placing the order creates a job with the store: you pay into escrow, and
				the money reaches the store once you confirm delivery.
			</span>
		</div>
	);
}

AddToCart.propTypes = {
	product: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired,
};

export default AddToCart;
