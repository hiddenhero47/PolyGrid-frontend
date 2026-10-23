import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
	LuArrowLeft,
	LuBadgeCheck,
	LuMapPin,
	LuCalendar,
	LuExternalLink,
	LuPackage,
} from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import ProfileAvatar from '../../components/profile-avatar';
import RatingStars from '../../components/rating-stars';
import ReviewsBlock from '../../components/reviews';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import SegmentedControl from '../../components/segmented-control';
import { Eyebrow } from '../home/elements/index.style';
import {
	ProfileHeader,
	ProfileSection,
} from '../engineering/profile/elements/index.style';
import {
	PROFILE_TYPE,
	MATERIAL_CATEGORY_LABELS,
} from '../../utilities/app-const';
import { countryName, humanize } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import CartLink from './elements/cart-link';
import PublicPage from './elements/page-states';
import { ProductCard } from './elements/product-cards';

const LIMIT = 12;
const categoryLabel = (value) =>
	MATERIAL_CATEGORY_LABELS[value] || humanize(value);

// frontend-plan §A.10 — a store's page: who they are, then the catalog,
// filterable by the store's own categories (and a sub-category typed by
// the seller). URL: ?category=&subCategory=&page=
function StorePage() {
	const { idOrSlug } = useParams();
	const [params, setParams] = useSearchParams();
	const category = params.get('category') || '';
	const subCategory = params.get('subCategory') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const query = StoreServices.getStore(idOrSlug, {
		category,
		subCategory,
		page,
		limit: LIMIT,
	});

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) =>
			value ? next.set(key, value) : next.delete(key)
		);
		if (!('page' in changes)) next.delete('page');
		setParams(next, { replace: true });
	};

	return (
		<PublicPage
			query={query}
			noun="store"
			browseTo={ROUTES.STORE}
			browseLabel="Browse stores"
		>
			{(store) => {
				const place = [store.city, countryName(store.country)]
					.filter(Boolean)
					.join(', ');
				// sub-categories are free text — offer the ones on this page
				const subCategories = [
					...new Set(
						(store.products || []).map((p) => p.subCategory).filter(Boolean)
					),
				];
				return (
					<>
						<ProfileHeader>
							<div className="relative mx-auto w-full max-w-360 px-4 py-10 md:px-8 lg:py-14 xl:px-12">
								<div className="mb-8 flex flex-wrap items-center justify-between gap-3">
									<Link
										to={ROUTES.STORE}
										className="font-label inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
									>
										<LuArrowLeft aria-hidden="true" /> All stores
									</Link>
									<CartLink />
								</div>
								<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
									<ProfileAvatar
										avatar={store.logo}
										name={store.storeName}
										size={104}
									/>
									<div className="min-w-0">
										<Eyebrow>Materials store</Eyebrow>
										<h1 className="sc_headline mt-2">
											{store.storeName}
											{store.isVerified && (
												<LuBadgeCheck
													className="ml-2 inline align-[-4px] text-[30px] text-(--pg-status-success)"
													aria-label="Verified"
												/>
											)}
										</h1>
										<div className="sc_meta mt-4">
											<RatingStars
												value={store.ratingAverage}
												count={store.ratingCount}
											/>
											{place && (
												<span className="inline-flex items-center gap-1.5">
													<LuMapPin aria-hidden="true" /> {place}
												</span>
											)}
											{store.createdAt && (
												<span className="inline-flex items-center gap-1.5">
													<LuCalendar aria-hidden="true" /> On PolyGrid since{' '}
													{new Date(store.createdAt).getFullYear()}
												</span>
											)}
										</div>
										{store.description && (
											<p className="mt-5 max-w-180 text-[15.5px] leading-relaxed text-(--pg-text-secondary)">
												{store.description}
											</p>
										)}
									</div>
								</div>
							</div>
						</ProfileHeader>

						<div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-10 md:px-8 xl:px-12">
							<section
								aria-labelledby="catalog-heading"
								className="flex flex-col gap-5"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<h2
										id="catalog-heading"
										className="font-display text-2xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase"
									>
										Catalog · {store.pagination?.total ?? 0}
									</h2>
								</div>
								<div className="overflow-x-auto">
									<SegmentedControl
										label="Category"
										options={[
											{ value: '', label: 'All' },
											...(store.categories || []).map((c) => ({
												value: c,
												label: categoryLabel(c),
											})),
										]}
										value={category}
										onChange={(value) =>
											update({ category: value, subCategory: '' })
										}
									/>
								</div>
								{(subCategories.length > 1 || subCategory) && (
									<div
										className="flex flex-wrap gap-2"
										role="group"
										aria-label="Type"
									>
										{subCategories.map((sub) => (
											<button
												key={sub}
												type="button"
												aria-pressed={sub === subCategory}
												onClick={() =>
													update({
														subCategory: sub === subCategory ? '' : sub,
													})
												}
												className="rounded-full border border-(--pg-chip-border) px-3 py-1.5 text-sm text-(--pg-chip-text) aria-pressed:border-(--pg-border-focus) aria-pressed:text-(--pg-text-primary)"
											>
												{sub}
											</button>
										))}
									</div>
								)}
								{store.products?.length ? (
									<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
										{store.products.map((product) => (
											<li key={product.id}>
												<ProductCard product={product} />
											</li>
										))}
									</ul>
								) : (
									<EmptyState
										compact
										icon={<LuPackage />}
										title="Nothing here yet"
										text={
											category
												? 'No products in this category right now.'
												: 'This store hasn’t listed products yet.'
										}
									/>
								)}
								{store.pagination?.totalPages > 1 && (
									<Pagination
										pagination={store.pagination}
										changePage={(next) =>
											update({ page: next > 1 ? String(next) : '' })
										}
									/>
								)}
							</section>

							<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
								<ProfileSection>
									<h2 className="sc_sectionTitle">Reviews</h2>
									<ReviewsBlock
										profileType={PROFILE_TYPE.STORE}
										profileId={store.id}
										ratingAverage={store.ratingAverage}
										ratingCount={store.ratingCount}
									/>
								</ProfileSection>
								{store.links?.length > 0 && (
									<ProfileSection>
										<h2 className="sc_sectionTitle">Links</h2>
										<ul className="flex flex-col gap-2">
											{store.links.map((link) => (
												<li key={link.url}>
													<a
														href={link.url}
														target="_blank"
														rel="noopener noreferrer nofollow"
														className="inline-flex items-center gap-2 font-semibold text-(--pg-text-link) hover:underline"
													>
														{link.label} <LuExternalLink aria-hidden="true" />
													</a>
												</li>
											))}
										</ul>
									</ProfileSection>
								)}
							</div>
						</div>
					</>
				);
			}}
		</PublicPage>
	);
}

export default StorePage;
