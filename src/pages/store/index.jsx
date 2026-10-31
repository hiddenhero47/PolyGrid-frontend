import React, { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
	LuSlidersHorizontal,
	LuX,
	LuStore,
	LuSearchX,
	LuCloudOff,
	LuRotateCw,
	LuArrowRight,
	LuBadgeCheck,
	LuMapPin,
} from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import Modal from '../../components/modal/index_modal';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import ProfileAvatar from '../../components/profile-avatar';
import RatingStars from '../../components/rating-stars';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip, Eyebrow } from '../home/elements/index.style';
import {
	PageBand,
	FilterPill,
	ConsultantCardShell as CardShell,
} from '../engineering/elements/index.style';
import DirectoryFilters from '../directory/elements/directory-filters';
import {
	MATERIAL_CATEGORY,
	MATERIAL_CATEGORY_LABELS,
} from '../../utilities/app-const';
import {
	countryName,
	enumToOptions,
	humanize,
} from '../../utilities/basic-functions';
import { ROUTES, storePath } from '../../utilities/app-routes';
import StoreSwitch from './elements/store-switch';
import CartLink from './elements/cart-link';
import { ProductCard } from './elements/product-cards';

const LIMIT = 12;
const categoryLabel = (value) =>
	MATERIAL_CATEGORY_LABELS[value] || humanize(value);
// DirectoryFilters takes a directory-style config
const FILTER = {
	filter: 'category',
	filterLabel: 'Category',
	filterAny: 'Any category',
	options: enumToOptions(MATERIAL_CATEGORY, MATERIAL_CATEGORY_LABELS),
};

// frontend-plan §A.9 — Browse Stores. Store-first (unlike the digital
// feed): each card is a store with a few of its products — those in the
// chosen category, when one is picked. URL: ?category=&country=&page=
function BrowseStores() {
	const [params, setParams] = useSearchParams();
	const filterRef = useRef(null);
	const category = params.get('category') || '';
	const country = params.get('country') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);

	const { data, isPending, isError, isFetching, refetch } =
		StoreServices.searchStores({
			category,
			country,
			page,
			limit: LIMIT,
		});
	const stores = data?.data ?? [];
	const total = data?.pagination?.total ?? 0;
	const hasFilters = Boolean(category || country);

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) =>
			value ? next.set(key, value) : next.delete(key)
		);
		next.delete('page');
		setParams(next);
	};
	const changePage = (nextPage) => {
		const next = new URLSearchParams(params);
		if (nextPage > 1) next.set('page', String(nextPage));
		else next.delete('page');
		setParams(next);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const filters = (prefix) => (
		<DirectoryFilters
			dir={FILTER}
			idPrefix={prefix}
			value={category}
			country={country}
			onChange={update}
			onReset={() => setParams({})}
		/>
	);

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-360 px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>PolyGrid Store</Eyebrow>
					<h1 className="sc_title mt-3">Building materials</h1>
					<p className="sc_subtitle">
						Cement, steel, blocks, roofing, timber, tools and more from verified
						suppliers — each sets its own delivery areas and prices.
					</p>
					<div className="mt-6 flex flex-wrap items-center gap-3">
						<StoreSwitch />
						<CartLink />
					</div>
				</div>
			</PageBand>

			<div className="mx-auto grid w-full max-w-360 gap-8 px-4 py-10 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:px-12">
				<aside className="hidden lg:block">
					<div className="sticky top-24">{filters('side')}</div>
				</aside>

				<section
					aria-labelledby="results-heading"
					className="flex min-w-0 flex-col gap-6"
				>
					<div className="flex flex-wrap items-center gap-3">
						<h2
							id="results-heading"
							className="font-label text-xs font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase"
						>
							{isPending
								? 'Loading…'
								: `${total.toLocaleString()} store${total === 1 ? '' : 's'}`}
						</h2>
						{category && (
							<FilterPill
								type="button"
								onClick={() => update({ category: '' })}
							>
								{categoryLabel(category)}
								<LuX className="sc_x" aria-label="Remove filter" />
							</FilterPill>
						)}
						{country && (
							<FilterPill type="button" onClick={() => update({ country: '' })}>
								{countryName(country)}
								<LuX className="sc_x" aria-label="Remove filter" />
							</FilterPill>
						)}
						<span className="ml-auto lg:hidden">
							<AppButton
								size="sm"
								variant="secondary"
								icon={<LuSlidersHorizontal />}
								onClick={() => filterRef.current.open()}
							>
								Filters
							</AppButton>
						</span>
					</div>

					{isPending && (
						<div className="flex flex-col gap-5">
							{Array.from({ length: 3 }, (_, i) => (
								<div
									key={i}
									className="flex flex-col gap-4 rounded-[18px] border border-(--pg-card-border) p-6"
								>
									<SkeletonBar $width="40%" />
									<SkeletonBar $width="70%" />
									<SkeletonBar $width="100%" style={{ height: 120 }} />
								</div>
							))}
						</div>
					)}

					{isError && (
						<EmptyState
							tone="error"
							icon={<LuCloudOff />}
							title="Couldn’t load stores"
							text="Check your connection and try again."
							actions={
								<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
									Retry
								</AppButton>
							}
							role="alert"
						/>
					)}

					{!isPending &&
						!isError &&
						stores.length === 0 &&
						(hasFilters ? (
							<EmptyState
								icon={<LuSearchX />}
								title="No matches"
								text="No verified stores sell this category here yet. Try another category or country."
								actions={
									<AppButton variant="secondary" onClick={() => setParams({})}>
										Clear filters
									</AppButton>
								}
							/>
						) : (
							<EmptyState
								tone="accent"
								icon={<LuStore />}
								eyebrow="Be one of the first"
								title="No stores listed yet"
								text="Verified material suppliers appear here once they set up a store and subscribe. Do you sell building materials?"
								actions={
									<AppButton
										to={ROUTES.DASHBOARD_STORE}
										icon={<LuArrowRight />}
									>
										Open a store
									</AppButton>
								}
							/>
						))}

					{stores.length > 0 && (
						<div
							className="flex flex-col gap-5 transition-opacity"
							style={{ opacity: isFetching ? 0.6 : 1 }}
						>
							{stores.map((store) => {
								const place = [store.city, countryName(store.country)]
									.filter(Boolean)
									.join(', ');
								return (
									<CardShell key={store.id}>
										<div className="flex flex-wrap items-start gap-4">
											<ProfileAvatar
												avatar={store.logo}
												name={store.storeName}
												size={56}
											/>
											<div className="min-w-0 flex-1">
												<h3 className="sc_headline">
													<Link to={storePath(store)} className="sc_link">
														{store.storeName}
													</Link>
													{store.isVerified && (
														<LuBadgeCheck
															className="ml-1.5 inline align-[-2px] text-[18px] text-(--pg-status-success)"
															aria-label="Verified"
														/>
													)}
												</h3>
												<div className="sc_meta mt-2">
													{place && (
														<span className="inline-flex items-center gap-1.5">
															<LuMapPin aria-hidden="true" /> {place}
														</span>
													)}
													<RatingStars
														value={store.ratingAverage}
														count={store.ratingCount}
													/>
												</div>
											</div>
											<AppButton
												size="sm"
												variant="secondary"
												to={storePath(store)}
												icon={<LuArrowRight />}
											>
												Visit store
											</AppButton>
										</div>
										<div className="flex flex-wrap gap-2">
											{store.categories?.slice(0, 5).map((c) => (
												<Chip key={c}>{categoryLabel(c)}</Chip>
											))}
										</div>
										{store.previewProducts?.length > 0 && (
											<ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
												{store.previewProducts.slice(0, 4).map((product) => (
													<li key={product.id}>
														<ProductCard product={product} compact />
													</li>
												))}
											</ul>
										)}
									</CardShell>
								);
							})}
						</div>
					)}

					{data?.pagination?.totalPages > 1 && (
						<Pagination pagination={data.pagination} changePage={changePage} />
					)}
				</section>
			</div>

			<Modal.Right refName={filterRef} width="360px" queryWidth="100%">
				<Modal.Card
					eyebrow="Building materials"
					title="Filters"
					footer={
						<AppButton onClick={() => filterRef.current.close()}>
							Show {total.toLocaleString()} store{total === 1 ? '' : 's'}
						</AppButton>
					}
				>
					{filters('drawer')}
				</Modal.Card>
			</Modal.Right>
		</>
	);
}

export default BrowseStores;
