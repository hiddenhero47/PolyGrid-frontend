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
import DirectoryServices from '../../features/services/custom-hooks/directory';
import Modal from '../../components/modal/index_modal';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import { Eyebrow } from '../home/elements/index.style';
import { countryName } from '../../utilities/basic-functions';
import PropTypes from 'prop-types';
import { ROUTES } from '../../utilities/app-routes';
import ProfileCard from './elements/profile-card';
import DirectoryFilters from './elements/directory-filters';
import { DIRECTORIES } from './config';
import { PageBand, FilterPill } from '../engineering/elements/index.style';
import { SkeletonBar } from '../../components/table/index.style';

const LIMIT = 12;

// frontend-plan §A.7 / §A.15 — a public directory (contractors, SiteForce
// workers), shaped by ./config.js. Same pattern as Browse Consultants.
// URL: ?<dir.filter>=&country=&page=
function BrowseDirectory({ kind }) {
	const dir = DIRECTORIES[kind];
	const [params, setParams] = useSearchParams();
	const filterRef = useRef(null);

	const value = params.get(dir.filter) || '';
	const country = params.get('country') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);

	const { data, isPending, isError, isFetching, refetch } =
		DirectoryServices.search(dir.api, {
			[dir.filter]: value,
			country,
			page,
			limit: LIMIT,
		});
	const profiles = data?.data ?? [];
	const total = data?.pagination?.total ?? 0;
	const hasFilters = Boolean(value || country);

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
		<DirectoryFilters
			dir={dir}
			idPrefix={prefix}
			value={value}
			country={country}
			onChange={updateFilters}
			onReset={resetFilters}
		/>
	);

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-360 px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>{dir.pillar}</Eyebrow>
					<h1 className="sc_title mt-3">{dir.title}</h1>
					<p className="sc_subtitle">{dir.subtitle}</p>
				</div>
			</PageBand>

			<div className="mx-auto grid w-full max-w-360 gap-8 px-4 py-10 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:px-12">
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
								: `${total.toLocaleString()} ${total === 1 ? dir.singular : dir.plural}`}
						</h2>

						{value && (
							<FilterPill
								type="button"
								onClick={() => updateFilters({ [dir.filter]: '' })}
							>
								{dir.valueLabel(value)}
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
							title={`Couldn’t load ${dir.plural}`}
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
								text={`No verified ${dir.plural} match these filters yet. Try another ${dir.filterLabel.toLowerCase()} or country.`}
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
								title={`No ${dir.plural} listed yet`}
								text={`Verified ${dir.plural} appear here once they set up a profile, get verified and subscribe. Are you one?`}
								actions={
									<AppButton to={dir.joinRoute} icon={<LuArrowRight />}>
										{dir.joinLabel}
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
								<ProfileCard key={profile.id} profile={profile} dir={dir} />
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
					eyebrow={dir.title}
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

BrowseDirectory.propTypes = {
	kind: PropTypes.oneOf(Object.keys(DIRECTORIES)).isRequired,
};

export default BrowseDirectory;
