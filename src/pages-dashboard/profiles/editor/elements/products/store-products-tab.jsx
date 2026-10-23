import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	LuPlus,
	LuPackage,
	LuCloudOff,
	LuRotateCw,
	LuTags,
} from 'react-icons/lu';
import ProductServices from '../../../../../features/services/custom-hooks/products';
import EmptyState from '../../../../../components/empty-state';
import StatusBadge from '../../../../../components/status-badge';
import Pagination from '../../../../../components/pagination';
import { AppButton } from '../../../../../components/button';
import { MATERIAL_CATEGORY_LABELS } from '../../../../../utilities/app-const';
import {
	formatMoney,
	humanize,
} from '../../../../../utilities/basic-functions';
import StoreProductModal from './store-product-modal';
import { ProductRow } from './index.style';

const STOCK_BADGES = {
	in_stock: { label: 'In stock', tone: 'success' },
	out_of_stock: { label: 'Out of stock', tone: 'error' },
	made_to_order: { label: 'Made to order', tone: 'info' },
};

// A store's products (GET /api/store-profiles/me/products — every one,
// whatever the store's verification or plan). Click one to edit it.
function StoreProductsTab({ profile }) {
	const modalRef = useRef(null);
	const [page, setPage] = useState(1);
	const [openId, setOpenId] = useState(null); // null = closed or new
	const { data, isPending, isError, refetch } = ProductServices.myStoreProducts(
		{ page }
	);
	const items = data?.data || [];
	// read from the live list so image changes show straight away
	const open = items.find((p) => p.id === openId) || null;
	const hasCategories = profile.categories?.length > 0;

	const show = (id = null) => {
		setOpenId(id);
		modalRef.current.open();
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-(--pg-text-secondary)">
					{data
						? `${data.pagination.total} product${data.pagination.total === 1 ? '' : 's'}`
						: 'Products'}{' '}
					· prices and delivery in USD.
				</p>
				<AppButton
					size="sm"
					icon={<LuPlus />}
					disabled={!hasCategories}
					onClick={() => show()}
				>
					Add product
				</AppButton>
			</div>

			{!hasCategories ? (
				<EmptyState
					compact
					tone="accent"
					icon={<LuTags />}
					title="Pick your categories first"
					text="Products are listed under your store’s categories — choose them on the Details tab."
				/>
			) : isError ? (
				<EmptyState
					compact
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load your products"
					actions={
						<AppButton
							size="sm"
							icon={<LuRotateCw />}
							onClick={() => refetch()}
						>
							Retry
						</AppButton>
					}
				/>
			) : !isPending && items.length === 0 ? (
				<EmptyState
					compact
					tone="accent"
					icon={<LuPackage />}
					title="No products yet"
					text="Add what you sell — with a price, a unit and where you deliver."
				/>
			) : (
				<ul className="flex flex-col gap-3">
					{items.map((product) => (
						<li key={product.id}>
							<ProductRow type="button" onClick={() => show(product.id)}>
								<span className="sc_thumb" aria-hidden="true">
									{product.images?.[0] ? (
										<img src={product.images[0].url} alt="" loading="lazy" />
									) : (
										<LuPackage />
									)}
								</span>
								<span className="min-w-0 flex-1">
									<span className="sc_title">{product.title}</span>
									<span className="sc_meta">
										{MATERIAL_CATEGORY_LABELS[product.category] ||
											humanize(product.category)}
										{product.subCategory ? ` · ${product.subCategory}` : ''} ·
										delivers to {product.shippingLocations?.length || 0}{' '}
										location
										{product.shippingLocations?.length === 1 ? '' : 's'}
									</span>
									<span className="mt-2 inline-block">
										<StatusBadge
											status={product.stockStatus}
											map={STOCK_BADGES}
										/>
									</span>
								</span>
								<span className="sc_price">
									{formatMoney(product.price, product.currency)}
									<small>per {product.unit}</small>
								</span>
							</ProductRow>
						</li>
					))}
				</ul>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination pagination={data.pagination} changePage={setPage} />
				</div>
			)}

			<StoreProductModal
				refName={modalRef}
				product={open}
				store={profile}
				onClose={() => setOpenId(null)}
			/>
		</>
	);
}

StoreProductsTab.propTypes = {
	profile: PropTypes.object.isRequired,
};

export default StoreProductsTab;
