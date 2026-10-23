import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	LuArrowRight,
	LuCloudOff,
	LuPackage,
	LuRotateCw,
	LuShoppingCart,
	LuStore,
	LuTrash2,
} from 'react-icons/lu';
import OrderServices from '../../../features/services/custom-hooks/orders';
import StoreServices from '../../../features/services/custom-hooks/store';
import JobServices from '../../../features/services/custom-hooks/jobs';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../../components/empty-state';
import Pagination from '../../../components/pagination';
import StatusBadge from '../../../components/status-badge';
import SegmentedControl from '../../../components/segmented-control';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import { clearCartStore, selectCartStores } from '../../../store/slice/cart';
import { JOB_STATUS_BADGES } from '../../../utilities/app-const';
import {
	countryName,
	formatDate,
	formatMoney,
} from '../../../utilities/basic-functions';
import { ROUTES } from '../../../utilities/app-routes';
import { ListingCard } from '../elements/panels';
import { idOf } from '../elements/listing-helpers';

const LIMIT = 12;
const jobPath = (id) => `${ROUTES.DASHBOARD_JOBS}/${id}`;

const itemsText = (items = []) =>
	items.map((i) => `${i.quantity} × ${i.titleSnapshot}`).join(', ');

const destinationText = (d) =>
	d ? [d.state, countryName(d.country)].filter(Boolean).join(', ') : '';

function Skeletons() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 3 }, (_, i) => (
				<SkeletonBar
					key={i}
					$width="100%"
					style={{ height: 84, borderRadius: 16 }}
				/>
			))}
		</div>
	);
}

function LoadError({ refetch }) {
	return (
		<EmptyState
			tone="error"
			icon={<LuCloudOff />}
			title="Couldn’t load orders"
			actions={
				<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
					Retry
				</AppButton>
			}
		/>
	);
}

// The order's job carries its live status (awaiting confirmation,
// active = paid into escrow, completed…).
function JobStatus({ jobId }) {
	const { data: job } = JobServices.get(jobId);
	return job?.status ? (
		<StatusBadge status={job.status} map={JOB_STATUS_BADGES} />
	) : null;
}

function MyOrderRow({ order }) {
	const { data: store } = StoreServices.getStore(idOf(order.store), {
		limit: 1,
	});
	const name =
		store && store.available !== false ? store.storeName : 'Store order';
	return (
		<ListingCard
			to={jobPath(idOf(order.job))}
			title={name}
			facts={[
				itemsText(order.items),
				`to ${destinationText(order.shippingDestination)}`,
				formatDate(order.createdAt),
			]}
			aside={
				<>
					<span className="font-display text-lg font-semibold text-(--pg-text-primary)">
						{formatMoney(order.totalSnapshot, order.currency)}
					</span>
					<JobStatus jobId={idOf(order.job)} />
				</>
			}
		/>
	);
}

function StoreOrderRow({ order }) {
	const buyer = typeof order.buyer === 'object' ? order.buyer : null;
	return (
		<ListingCard
			to={jobPath(idOf(order.job))}
			title={buyer?.fullName || 'Buyer'}
			facts={[
				itemsText(order.items),
				`to ${destinationText(order.shippingDestination)}`,
				formatDate(order.createdAt),
			]}
			note={
				order.note && (
					<p className="mt-1.5 line-clamp-2 text-sm text-(--pg-text-primary)">
						“{order.note}”
					</p>
				)
			}
			aside={
				<>
					<span className="font-display text-lg font-semibold text-(--pg-text-primary)">
						{formatMoney(order.totalSnapshot, order.currency)}
					</span>
					<JobStatus jobId={idOf(order.job)} />
				</>
			}
		/>
	);
}

function CartView() {
	const dispatch = useDispatch();
	const stores = useSelector(selectCartStores);
	if (!stores.length)
		return (
			<EmptyState
				tone="accent"
				icon={<LuShoppingCart />}
				title="Your cart is empty"
				text="Add materials from a store’s products — each store is checked out on its own."
				actions={<AppButton to={ROUTES.STORE}>Browse stores</AppButton>}
			/>
		);
	return (
		<ul className="flex flex-col gap-3">
			{stores.map((entry) => {
				const subtotal = entry.items.reduce(
					(s, i) => s + i.price * i.quantity,
					0
				);
				return (
					<li
						key={entry.storeId}
						className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4"
					>
						<LuStore
							aria-hidden="true"
							className="shrink-0 text-xl text-(--pg-text-secondary)"
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate text-[15.5px] font-semibold text-(--pg-text-primary)">
								{entry.storeName}
							</p>
							<p className="mt-0.5 truncate text-sm text-(--pg-text-secondary)">
								{entry.items
									.map((i) => `${i.quantity} × ${i.title}`)
									.join(', ')}
							</p>
						</div>
						<span className="font-semibold text-(--pg-text-primary)">
							{formatMoney(subtotal, entry.items[0]?.currency)} + delivery
						</span>
						<AppButton
							to={`${ROUTES.DASHBOARD_ORDERS}/checkout/${entry.storeId}`}
							icon={<LuArrowRight />}
						>
							Check out
						</AppButton>
						<button
							type="button"
							aria-label={`Empty the cart for ${entry.storeName}`}
							onClick={() => dispatch(clearCartStore(entry.storeId))}
							className="inline-flex size-10 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error)"
						>
							<LuTrash2 aria-hidden="true" />
						</button>
					</li>
				);
			})}
		</ul>
	);
}

function OrdersList({ query, Row, empty }) {
	const rows = query.data?.data || [];
	if (query.isPending) return <Skeletons />;
	if (query.isError) return <LoadError refetch={query.refetch} />;
	if (!rows.length) return empty;
	return (
		<ul
			className="flex flex-col gap-3 transition-opacity"
			style={{ opacity: query.isFetching ? 0.6 : 1 }}
		>
			{rows.map((order) => (
				<li key={order.id}>
					<Row order={order} />
				</li>
			))}
		</ul>
	);
}

function MineView({ page, setPage }) {
	const query = OrderServices.mine({ page, limit: LIMIT });
	return (
		<>
			<OrdersList
				query={query}
				Row={MyOrderRow}
				empty={
					<EmptyState
						tone="accent"
						icon={<LuPackage />}
						title="No orders yet"
						text="Order materials from verified stores — you pay into escrow and confirm delivery to release it."
						actions={<AppButton to={ROUTES.STORE}>Browse stores</AppButton>}
					/>
				}
			/>
			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination pagination={query.data.pagination} changePage={setPage} />
				</div>
			)}
		</>
	);
}

function StoreView({ page, setPage }) {
	const query = OrderServices.store({ page, limit: LIMIT });
	if (query.data?.noStore)
		return (
			<EmptyState
				tone="accent"
				icon={<LuStore />}
				title="You don’t have a store"
				text="Open a materials store to sell on PolyGrid — orders you receive show here."
				actions={
					<AppButton to={ROUTES.DASHBOARD_STORE}>Open a store</AppButton>
				}
			/>
		);
	return (
		<>
			<OrdersList
				query={query}
				Row={StoreOrderRow}
				empty={
					<EmptyState
						icon={<LuStore />}
						title="No orders received yet"
						text="When someone orders from your store, it shows here with a job to deliver against."
					/>
				}
			/>
			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination pagination={query.data.pagination} changePage={setPage} />
				</div>
			)}
		</>
	);
}

// frontend-plan §B.13 — Store orders: the cart, orders I placed, and
// orders my store received. Each order's payment and delivery live on
// its job. URL: ?view=cart|mine|store&page=
function Orders() {
	const [params, setParams] = useSearchParams();
	const cartCount = useSelector(selectCartStores).length;
	const views = [
		{ value: 'mine', label: 'My orders' },
		{ value: 'cart', label: cartCount ? `Cart (${cartCount})` : 'Cart' },
		{ value: 'store', label: 'My store’s orders' },
	];
	const view = views.some((v) => v.value === params.get('view'))
		? params.get('view')
		: 'mine';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const setPage = (next) => {
		const p = new URLSearchParams(params);
		if (next > 1) p.set('page', String(next));
		else p.delete('page');
		setParams(p);
	};

	return (
		<>
			<PageHeader
				eyebrow="PolyGrid Store"
				title="Orders"
				subtitle="Materials bought and sold through PolyGrid. Every order is a job: the buyer pays into escrow and the store is paid once delivery is confirmed."
				actions={
					<AppButton to={ROUTES.STORE} variant="secondary" icon={<LuStore />}>
						Browse stores
					</AppButton>
				}
			/>
			<div className="mb-6 overflow-x-auto">
				<SegmentedControl
					label="Show"
					options={views}
					value={view}
					onChange={(v) => setParams(v === 'mine' ? {} : { view: v })}
				/>
			</div>
			{view === 'cart' ? (
				<CartView />
			) : view === 'store' ? (
				<StoreView page={page} setPage={setPage} />
			) : (
				<MineView page={page} setPage={setPage} />
			)}
		</>
	);
}

export default Orders;
