import React, { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
	LuClock,
	LuCloudOff,
	LuDownload,
	LuFileText,
	LuRefreshCw,
	LuRotateCw,
	LuShoppingBag,
} from 'react-icons/lu';
import PurchaseServices from '../../features/services/custom-hooks/purchases';
import PaymentServices from '../../features/services/custom-hooks/payments';
import { getErrorMessage } from '../../features/services/index-client';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import Modal from '../../components/modal/index_modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import { DIGITAL_PRODUCT_CATEGORY_LABELS } from '../../utilities/app-const';
import {
	formatDate,
	formatMoney,
	humanize,
} from '../../utilities/basic-functions';
import { ROUTES, digitalProductPath } from '../../utilities/app-routes';
import { idOf } from '../elements/listing-helpers';

const LIMIT = 12;
const STATUS = {
	success: { label: 'Paid', tone: 'success' },
	pending: { label: 'Payment pending', tone: 'warning' },
};

const kb = (size) =>
	size >= 1024 * 1024
		? `${(size / 1024 / 1024).toFixed(1)} MB`
		: `${Math.max(1, Math.round(size / 1024))} KB`;

// The download center for one purchase: the buyer's own copy, kept even
// if the listing changes or goes. 410 / 503 are expected states, not
// errors (frontend-plan §B.14).
function DownloadModal({ refName, purchase, result }) {
	const status = result?.error?.response?.status;
	return (
		<Modal.Center refName={refName} width="560px" queryWidth="100%">
			<Modal.Card
				eyebrow="Download center"
				title={purchase?.product?.title || 'Your files'}
				subtitle="Links are short-lived — download now, or reopen this to get fresh ones."
			>
				{result?.isPending ? (
					<p className="text-sm text-(--pg-text-secondary)">
						Getting your links…
					</p>
				) : status === 410 ? (
					<EmptyState
						icon={<LuClock />}
						title="Your copy has expired"
						text="Files are kept for a while after a subscription lapses, then cleared. Renew your plan before buying again to keep future copies."
						actions={
							<AppButton to={ROUTES.DASHBOARD_SUBSCRIPTION}>
								Subscription
							</AppButton>
						}
					/>
				) : status === 503 ? (
					<EmptyState
						icon={<LuRefreshCw />}
						title="Still being prepared"
						text="Your copy is being set up — try again in a minute."
					/>
				) : result?.error ? (
					<EmptyState
						tone="error"
						icon={<LuCloudOff />}
						title={getErrorMessage(result.error)}
					/>
				) : (
					<ul className="flex flex-col gap-2">
						{(result?.data?.files || []).map((file) => (
							<li
								key={file.fileName}
								className="flex items-center gap-3 rounded-xl border border-(--pg-card-border) px-3 py-2.5 text-sm"
							>
								<LuFileText
									aria-hidden="true"
									className="shrink-0 text-(--pg-text-secondary)"
								/>
								<span className="min-w-0 flex-1 truncate text-(--pg-text-primary)">
									{file.fileName}
								</span>
								{file.size > 0 && (
									<span className="text-xs text-(--pg-text-secondary)">
										{kb(file.size)}
									</span>
								)}
								<a
									href={file.downloadUrl}
									download={file.fileName}
									className="inline-flex items-center gap-1.5 font-semibold text-(--pg-text-highlight) hover:underline"
								>
									<LuDownload aria-hidden="true" /> Download
								</a>
							</li>
						))}
					</ul>
				)}
			</Modal.Card>
		</Modal.Center>
	);
}

// frontend-plan §B.14 — My purchases. Title / category / preview come
// live from the listing (can be blank if it was removed); price, status
// and date are the purchase's own and always show.
function Purchases() {
	const [params, setParams] = useSearchParams();
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const query = PurchaseServices.mine({ page, limit: LIMIT });
	const refreshPurchases = PurchaseServices.useRefresh();
	const links = PurchaseServices.downloadLinks();
	const refreshPayment = PaymentServices.refresh();
	const modalRef = useRef(null);
	const [current, setCurrent] = useState(null);
	const rows = query.data?.data || [];

	const openDownloads = (purchase) => {
		setCurrent(purchase);
		links.reset();
		links.mutate(purchase.id);
		modalRef.current.open();
	};

	// a pending purchase: ask Stripe directly whether it went through
	const checkPayment = (purchase) => {
		if (!purchase.paymentId)
			return toast.info(
				'No payment found for this purchase yet — try again shortly.'
			);
		refreshPayment.mutate(purchase.paymentId, {
			onSuccess: (res) => {
				refreshPurchases();
				if (res?.status === 'success')
					toast.success('Payment confirmed — your files are ready');
				else if (res?.status === 'failed')
					toast.error(
						'That payment didn’t go through — open the file and buy it again.'
					);
				else toast.info('Still waiting on the card payment.');
			},
		});
	};

	return (
		<>
			<PageHeader
				eyebrow="PolyGrid Store"
				title="Purchases"
				subtitle="Digital files you’ve bought. Your copy stays downloadable even if the creator changes or removes the listing."
				actions={
					<AppButton
						to={ROUTES.DIGITAL_STORE}
						variant="secondary"
						icon={<LuShoppingBag />}
					>
						Browse files
					</AppButton>
				}
			/>

			{query.isPending ? (
				<div className="flex flex-col gap-3">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 88, borderRadius: 16 }}
						/>
					))}
				</div>
			) : query.isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load your purchases"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			) : rows.length === 0 ? (
				<EmptyState
					tone="accent"
					icon={<LuShoppingBag />}
					title="No purchases yet"
					text="Floor plans, drafting packs, BOQ sheets and templates from verified creators."
					actions={
						<AppButton to={ROUTES.DIGITAL_STORE}>
							Browse digital files
						</AppButton>
					}
				/>
			) : (
				<ul className="flex flex-col gap-3">
					{rows.map((purchase) => {
						const product =
							typeof purchase.product === 'object' ? purchase.product : null;
						const image = product?.previewImages?.[0]?.url;
						return (
							<li
								key={purchase.id}
								className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4"
							>
								{image ? (
									<img
										src={image}
										alt=""
										className="size-14 shrink-0 rounded-xl object-cover"
									/>
								) : (
									<span className="grid size-14 shrink-0 place-items-center rounded-xl bg-(--pg-surface-card) text-(--pg-text-secondary)">
										<LuFileText aria-hidden="true" />
									</span>
								)}
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										{product?.title ? (
											<Link
												to={digitalProductPath({ id: idOf(product) })}
												className="truncate text-[15.5px] font-semibold text-(--pg-text-primary) hover:underline"
											>
												{product.title}
											</Link>
										) : (
											<span className="text-[15.5px] font-semibold text-(--pg-text-secondary)">
												Listing no longer available
											</span>
										)}
										{product?.category && (
											<Chip>
												{DIGITAL_PRODUCT_CATEGORY_LABELS[product.category] ||
													humanize(product.category)}
											</Chip>
										)}
									</div>
									<p className="mt-1 text-sm text-(--pg-text-secondary)">
										{purchase.priceSnapshot === 0
											? 'Free'
											: formatMoney(
													purchase.priceSnapshot,
													purchase.currency
												)}{' '}
										· {formatDate(purchase.createdAt)}
									</p>
								</div>
								<StatusBadge status={purchase.status} map={STATUS} />
								{purchase.status === 'success' ? (
									<AppButton
										icon={<LuDownload />}
										onClick={() => openDownloads(purchase)}
									>
										Download
									</AppButton>
								) : (
									<>
										<AppButton
											variant="secondary"
											icon={<LuRefreshCw />}
											onClick={() => checkPayment(purchase)}
											disabled={refreshPayment.isPending}
										>
											Check payment status
										</AppButton>
										{product?.title && (
											<AppButton
												to={digitalProductPath({ id: idOf(product) })}
												icon={<LuShoppingBag />}
											>
												Finish paying
											</AppButton>
										)}
									</>
								)}
							</li>
						);
					})}
				</ul>
			)}

			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={query.data.pagination}
						changePage={(next) =>
							setParams(next > 1 ? { page: String(next) } : {})
						}
					/>
				</div>
			)}

			<DownloadModal refName={modalRef} purchase={current} result={links} />
		</>
	);
}

export default Purchases;
