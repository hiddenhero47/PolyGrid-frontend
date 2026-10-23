import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuCloudOff,
	LuGavel,
	LuPlus,
	LuRotateCw,
	LuSearchX,
} from 'react-icons/lu';
import TenderServices from '../../features/services/custom-hooks/tenders';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { CustomSelect } from '../../components/form-components';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import {
	BID_STATUS_BADGES,
	PROFILE_TYPE,
	TENDER_STATUS_BADGES,
} from '../../utilities/app-const';
import { formatMoney, specialtyLabel } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import EligibilityGate from '../elements/eligibility-gate';
import { ListingCard } from '../elements/panels';
import {
	budgetText,
	closesText,
	idOf,
	placeText,
} from '../elements/listing-helpers';
import { CATEGORY_OPTIONS } from './elements/project-schema';

const LIMIT = 12;
const VIEWS = [
	{ value: 'board', label: 'Open board' },
	{ value: 'bids', label: 'My bids' },
	{ value: 'projects', label: 'My projects' },
];

const projectPath = (id) => `${ROUTES.DASHBOARD_TENDERS}/${id}`;

function Skeletons() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 4 }, (_, i) => (
				<SkeletonBar
					key={i}
					$width="100%"
					style={{ height: 84, borderRadius: 16 }}
				/>
			))}
		</div>
	);
}

function LoadError({ refetch, what }) {
	return (
		<EmptyState
			tone="error"
			icon={<LuCloudOff />}
			title={`Couldn’t load ${what}`}
			actions={
				<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
					Retry
				</AppButton>
			}
		/>
	);
}

function ProjectRow({ project, showStatus }) {
	return (
		<ListingCard
			to={projectPath(project.id)}
			title={project.title}
			chips={<Chip>{specialtyLabel(project.category)}</Chip>}
			facts={[
				placeText(project.location),
				closesText(project.bidDeadline),
				`${project.bidCount || 0} bid${project.bidCount === 1 ? '' : 's'}`,
			]}
			aside={
				<>
					<span className="text-sm font-semibold text-(--pg-text-primary)">
						{budgetText(project)}
					</span>
					{showStatus && (
						<StatusBadge status={project.status} map={TENDER_STATUS_BADGES} />
					)}
				</>
			}
		/>
	);
}

// The open board — eligible contractors only; a 403 shows the gate.
function BoardView({ params, update }) {
	const category = params.get('category') || '';
	const country = params.get('country') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { data: countries = [] } = ReferenceServices.getCountries();
	const board = TenderServices.board({ category, country, page, limit: LIMIT });

	if (board.isError && board.error?.response?.status === 403)
		return (
			<EligibilityGate
				profileType={PROFILE_TYPE.CONTRACTOR}
				action="browse and bid on tender projects"
				assumeBlocked
			/>
		);

	const projects = board.data?.data || [];
	return (
		<>
			<div className="mb-5 grid gap-4 sm:grid-cols-2 lg:max-w-180">
				<CustomSelect
					id="tender-category"
					label="Category"
					placeholder="Any category"
					clearable
					options={CATEGORY_OPTIONS}
					value={category}
					onChange={(v) => update({ category: v, page: '' })}
				/>
				<CustomSelect
					id="tender-country"
					label="Country"
					placeholder="Any country"
					clearable
					options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
					value={country}
					onChange={(v) => update({ country: v, page: '' })}
				/>
			</div>
			{board.isPending ? (
				<Skeletons />
			) : board.isError ? (
				<LoadError refetch={board.refetch} what="the board" />
			) : projects.length === 0 ? (
				<EmptyState
					icon={<LuSearchX />}
					title={
						category || country
							? 'Nothing matches'
							: 'No open projects right now'
					}
					text={
						category || country
							? 'Try another category or country.'
							: 'New projects show here as soon as they’re posted.'
					}
					actions={
						(category || country) && (
							<AppButton
								variant="secondary"
								onClick={() => update({ category: '', country: '', page: '' })}
							>
								Clear filters
							</AppButton>
						)
					}
				/>
			) : (
				<ul
					className="flex flex-col gap-3 transition-opacity"
					style={{ opacity: board.isFetching ? 0.6 : 1 }}
				>
					{projects.map((p) => (
						<li key={p.id}>
							<ProjectRow project={p} />
						</li>
					))}
				</ul>
			)}
			{board.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={board.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' })
						}
					/>
				</div>
			)}
		</>
	);
}

// One of my bids — the list carries a summary of its project.
function BidRow({ bid }) {
	const project = typeof bid.project === 'object' ? bid.project : null;
	const projectId = idOf(bid.project);
	return (
		<ListingCard
			to={projectPath(projectId)}
			title={project?.title || 'Tender project'}
			chips={
				project?.status &&
				project.status !== 'open' && (
					<StatusBadge status={project.status} map={TENDER_STATUS_BADGES} />
				)
			}
			facts={[
				project?.bidDeadline && closesText(project.bidDeadline),
				bid.estimatedDurationDays && `${bid.estimatedDurationDays} days`,
			]}
			aside={
				<>
					<span className="font-display text-lg font-semibold text-(--pg-text-primary)">
						{formatMoney(bid.amount, bid.currency)}
					</span>
					<StatusBadge status={bid.status} map={BID_STATUS_BADGES} />
				</>
			}
		/>
	);
}

function BidsView({ params, update }) {
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const bids = TenderServices.myBids({ page, limit: LIMIT });
	const rows = bids.data?.data || [];

	if (bids.isPending) return <Skeletons />;
	if (bids.isError)
		return <LoadError refetch={bids.refetch} what="your bids" />;
	if (bids.data?.noProfile)
		return (
			<EligibilityGate
				profileType={PROFILE_TYPE.CONTRACTOR}
				action="bid on tender projects"
				assumeBlocked
			/>
		);
	if (!rows.length)
		return (
			<EmptyState
				tone="accent"
				icon={<LuGavel />}
				title="No bids yet"
				text="Find a project on the open board and send your price — it stays sealed from other contractors."
				actions={
					<AppButton onClick={() => update({ view: 'board', page: '' })}>
						Open the board
					</AppButton>
				}
			/>
		);
	return (
		<>
			<ul className="flex flex-col gap-3">
				{rows.map((bid) => (
					<li key={bid.id}>
						<BidRow bid={bid} />
					</li>
				))}
			</ul>
			{bids.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={bids.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' })
						}
					/>
				</div>
			)}
		</>
	);
}

function ProjectsView({ params, update }) {
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const mine = TenderServices.mine({ page, limit: LIMIT });
	const rows = mine.data?.data || [];

	if (mine.isPending) return <Skeletons />;
	if (mine.isError)
		return <LoadError refetch={mine.refetch} what="your projects" />;
	if (!rows.length)
		return (
			<EmptyState
				tone="accent"
				icon={<LuGavel />}
				title="You haven’t posted a project"
				text="Post the job, and verified contractors send sealed bids. You pick one and it becomes a job with escrow."
				actions={
					<AppButton to={`${ROUTES.DASHBOARD_TENDERS}/new`} icon={<LuPlus />}>
						Post a project
					</AppButton>
				}
			/>
		);
	return (
		<>
			<ul className="flex flex-col gap-3">
				{rows.map((p) => (
					<li key={p.id}>
						<ProjectRow project={p} showStatus />
					</li>
				))}
			</ul>
			{mine.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={mine.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' })
						}
					/>
				</div>
			)}
		</>
	);
}

// frontend-plan §B.7 / §B.8 — Tenders in the workspace: the open board
// and my bids (contractor side), my posted projects (poster side).
// URL: ?view=board|bids|projects&category=&country=&page=
function Tenders() {
	const [params, setParams] = useSearchParams();
	const { user } = useSelector((state) => state.auth);
	const view = VIEWS.some((v) => v.value === params.get('view'))
		? params.get('view')
		: 'board';

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([k, v]) =>
			v ? next.set(k, v) : next.delete(k)
		);
		if (next.get('view') === 'board') next.delete('view');
		setParams(next);
	};

	const View = { board: BoardView, bids: BidsView, projects: ProjectsView }[
		view
	];

	return (
		<>
			<PageHeader
				eyebrow="PolyGrid Tenders"
				title="Tenders"
				subtitle="Sealed bidding on construction projects. Contractors see the board and their own bids; posters see every bid on their projects and award one."
				actions={
					<AppButton to={`${ROUTES.DASHBOARD_TENDERS}/new`} icon={<LuPlus />}>
						Post a project
					</AppButton>
				}
			/>
			<div className="mb-6 overflow-x-auto">
				<SegmentedControl
					label="Show"
					options={VIEWS}
					value={view}
					onChange={(v) => {
						const next = new URLSearchParams();
						if (v !== 'board') next.set('view', v);
						setParams(next);
					}}
				/>
			</div>
			<View key={user?.id} params={params} update={update} />
		</>
	);
}

export default Tenders;
