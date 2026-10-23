import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuShoppingCart } from 'react-icons/lu';
import { selectCartCount } from '../../../store/slice/cart';
import { ROUTES } from '../../../utilities/app-routes';

// "Cart · 3" — shown on Store pages once something's in the cart.
function CartLink() {
	const count = useSelector(selectCartCount);
	if (!count) return null;
	return (
		<Link
			to={`${ROUTES.DASHBOARD_ORDERS}?view=cart`}
			className="inline-flex items-center gap-2 rounded-[14px] border border-(--pg-border-default) bg-(--pg-surface-background) px-4 py-2.5 text-sm font-semibold text-(--pg-text-primary) hover:border-(--pg-card-borderHover)"
		>
			<LuShoppingCart aria-hidden="true" /> Cart
			<span className="rounded-full bg-(--pg-button-primaryBg) px-2 py-0.5 text-xs text-(--pg-button-primaryText)">
				{count}
			</span>
		</Link>
	);
}

export default CartLink;
