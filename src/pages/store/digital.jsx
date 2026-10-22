import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuFiles, LuCloudOff, LuRotateCw, LuArrowRight } from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Eyebrow } from '../home/elements/index.style';
import { PageBand } from '../engineering/elements/index.style';
import {
	DIGITAL_PRODUCT_CATEGORY,
	DIGITAL_PRODUCT_CATEGORY_LABELS,
} from '../../utilities/app-const';
import { enumToOptions } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import StoreSwitch from './elements/store-switch';
import { DigitalCard } from './elements/product-cards';

const LIMIT = 16;
const CATEGORIES = [
	{ value: '', label: 'Everything' },
	...enumToOptions(DIGITAL_PRODUCT_CATEGORY, DIGITAL_PRODUCT_CATEGORY_LABELS),
];

// frontend-plan §A.12 — the digital feed: flat and cross-creator (not
// store-first like materials), newest first, filtered by category.
// URL: ?category=&page=
function DigitalFeed() {
	const [params, setParams] = useSearchParams();
	const category = params.get('category') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { data, isPending, isError, isFetching, refetch } =
		StoreServices.digitalFeed({
			category,
			page,
			limit: LIMIT,
		});
	const items = data?.data ?? [];

	const set = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) =>
			value ? next.set(key, value) : next.delete(key)
		);
		setParams(next);
	};

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>PolyGrid Store</Eyebrow>
					<h1 className="sc_title mt-3">Digital files</h1>
					<p className="sc_subtitle">
						Floor plans, structural drafting, site layout templates and BOQ
						sheets from verified creators — reviewed by our team before they go
						on sale.
					</p>
					<div className="mt-6">
						<StoreSwitch />
					</div>
				</div>
			</PageBand>

			<div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-10 md:px-8 xl:px-12">
				<div className="overflow-x-auto">
					<SegmentedControl
						label="Category"
						options={CATEGORIES}
						value={category}
						onChange={(value) => set({ category: value, page: '' })}
					/>
				</div>

				{isPending && (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
						{Array.from({ length: 8 }, (_, i) => (
							<div
								key={i}
								className="flex flex-col gap-3 rounded-2xl border border-(--pg-card-border) p-3"
							>
								<SkeletonBar
									$width="100%"
									style={{ height: 160, borderRadius: 12 }}
								/>
								<SkeletonBar $width="80%" />
								<SkeletonBar $width="40%" />
							</div>
						))}
					</div>
				)}

				{isError && (
					<EmptyState
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load the feed"
						actions={
							<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
								Retry
							</AppButton>
						}
						role="alert"
					/>
				)}

				{!isPending && !isError && items.length === 0 && (
					<EmptyState
						tone="accent"
						icon={<LuFiles />}
						eyebrow={category ? undefined : 'Be one of the first'}
						title={
							category ? 'Nothing in this category yet' : 'No files on sale yet'
						}
						text="Approved files from verified creators appear here. Do you draw plans or build templates?"
						actions={
							<AppButton to={ROUTES.DASHBOARD_CREATOR} icon={<LuArrowRight />}>
								Sell your files
							</AppButton>
						}
					/>
				)}

				{items.length > 0 && (
					<ul
						className="grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
						style={{ opacity: isFetching ? 0.6 : 1 }}
					>
						{items.map((product) => (
							<li key={product.id}>
								<DigitalCard product={product} creator={product.creator} />
							</li>
						))}
					</ul>
				)}

				{data?.pagination?.totalPages > 1 && (
					<Pagination
						pagination={data.pagination}
						changePage={(next) => {
							set({ page: next > 1 ? String(next) : '' });
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}}
					/>
				)}
			</div>
		</>
	);
}

export default DigitalFeed;
