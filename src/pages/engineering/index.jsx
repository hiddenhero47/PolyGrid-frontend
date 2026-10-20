import React, { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	LuSlidersHorizontal,
	LuX,
	LuUsersRound,
	LuSearchX,
	LuCloudOff,
	LuRotateCw,
	LuArrowRight,
} from 'react-icons/lu';
import ConsultancyServices from '../../features/services/custom-hooks/consultancy';
import Modal from '../../components/modal/index_modal';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import { Eyebrow } from '../home/elements/index.style';
import { SPECIALIZATION_LABELS } from '../../utilities/app-const';
import { countryName } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import ConsultantCard from './elements/consultant-card';
import ConsultantFilters from './elements/consultant-filters';
import { PageBand, FilterPill } from './elements/index.style';
import { SkeletonBar } from '../../components/table/index.style';

const LIMIT = 12;

// frontend-plan §A.5 — Browse Consultants (PolyGrid Engineering).
// Filters live in the URL (?specialization=&country=&page=), so results
// are shareable, Back/Forward work, and there's nothing to sync.
function BrowseConsultants() {
	const [params, setParams] = useSearchParams();
	const filterRef = useRef(null);

	const specialization = params.get('specialization') || '';
	const country = params.get('country') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);

	const { data, isPending, isError, isFetching, refetch } =
		ConsultancyServices.search({
			specialization,
			country,
			page,
			limit: LIMIT,
		});
	const profiles = data?.data ?? [];
	const total = data?.pagination?.total ?? 0;
	const hasFilters = Boolean(specialization || country);

	// any filter change goes back to page 1
	const updateFilters = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) => {
			if (value) next.set(key, value);
			else next.delete(key);
		});
		next.delete('page');
		setParams(next);
	};

	const resetFilters = () => setParams({});

	const changePage = (nextPage) => {
		const next = new URLSearchParams(params);
		if (nextPage > 1) next.set('page', String(nextPage));
		else next.delete('page');
		setParams(next);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const filters = (prefix) => (
		<ConsultantFilters
			idPrefix={prefix}
			specialization={specialization}
			country={country}
			onChange={updateFilters}
			onReset={resetFilters}
		/>
	);

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>PolyGrid Engineering</Eyebrow>
					<h1 className="sc_title mt-3">Engineering consultants</h1>
					<p className="sc_subtitle">
						Verified structural, geotechnical, hydraulic and architectural
						consultants. Book a fixed package, an hourly engagement or a single
						session — and find a mentor on the way up.
					</p>
				</div>
			</PageBand>

			<div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-10 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:px-12">
				{/* sidebar filters — desktop */}
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
								: `${total.toLocaleString()} consultant${total === 1 ? '' : 's'}`}
						</h2>

						{specialization && (
							<FilterPill
								type="button"
								onClick={() => updateFilters({ specialization: '' })}
							>
								{SPECIALIZATION_LABELS[specialization] || specialization}
								<LuX className="sc_x" aria-label="Remove filter" />
							</FilterPill>
						)}
						{country && (
							<FilterPill
								type="button"
								onClick={() => updateFilters({ country: '' })}
							>
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
						<div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
							{Array.from({ length: 6 }, (_, i) => (
								<div
									key={i}
									className="flex flex-col gap-4 rounded-[18px] border border-(--pg-card-border) bg-(--pg-card-background) p-6"
								>
									<div className="flex items-center gap-4">
										<SkeletonBar
											$width="56px"
											style={{ height: 56, borderRadius: 14 }}
										/>
										<div className="flex flex-1 flex-col gap-2">
											<SkeletonBar $width="70%" />
											<SkeletonBar $width="40%" />
										</div>
									</div>
									<SkeletonBar $width="90%" />
									<SkeletonBar $width="60%" />
								</div>
							))}
						</div>
					)}

					{isError && (
						<EmptyState
							tone="error"
							icon={<LuCloudOff />}
							title="Couldn’t load consultants"
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
						profiles.length === 0 &&
						(hasFilters ? (
							<EmptyState
								icon={<LuSearchX />}
								title="No matches"
								text="No verified consultants match these filters yet. Try another discipline or country."
								actions={
									<AppButton variant="secondary" onClick={resetFilters}>
										Clear filters
									</AppButton>
								}
							/>
						) : (
							<EmptyState
								tone="accent"
								icon={<LuUsersRound />}
								eyebrow="Be one of the first"
								title="No consultants listed yet"
								text="Verified engineering consultants appear here once they set up a profile and subscribe. Are you one?"
								actions={
									<AppButton to={ROUTES.REGISTER} icon={<LuArrowRight />}>
										Offer your services
									</AppButton>
								}
							/>
						))}

					{profiles.length > 0 && (
						<div
							className="grid gap-5 transition-opacity sm:grid-cols-2 2xl:grid-cols-3"
							style={{ opacity: isFetching ? 0.6 : 1 }}
						>
							{profiles.map((profile) => (
								<ConsultantCard
									key={profile.id || profile.slug || profile.userId}
									profile={profile}
								/>
							))}
						</div>
					)}

					{data?.pagination?.totalPages > 1 && (
						<Pagination pagination={data.pagination} changePage={changePage} />
					)}
				</section>
			</div>

			{/* filters drawer — phones / tablets */}
			<Modal.Right refName={filterRef} width="360px" queryWidth="100%">
				<Modal.Card
					eyebrow="Engineering consultants"
					title="Filters"
					footer={
						<AppButton onClick={() => filterRef.current.close()}>
							Show {total.toLocaleString()} result{total === 1 ? '' : 's'}
						</AppButton>
					}
				>
					{filters('drawer')}
				</Modal.Card>
			</Modal.Right>
		</>
	);
}

export default BrowseConsultants;
