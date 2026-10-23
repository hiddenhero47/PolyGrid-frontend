import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuCloudOff,
	LuCrosshair,
	LuHardHat,
	LuMapPin,
	LuPlus,
	LuRotateCw,
	LuSearchX,
	LuX,
} from 'react-icons/lu';
import SiteForceServices from '../../../features/services/custom-hooks/siteforce';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../../components/empty-state';
import Pagination from '../../../components/pagination';
import StatusBadge from '../../../components/status-badge';
import SegmentedControl from '../../../components/segmented-control';
import { AppButton } from '../../../components/button';
import { CustomSelect } from '../../../components/form-components';
import { parseLatLng } from '../../../components/location-picker/parse';
import { SkeletonBar } from '../../../components/table/index.style';
import { Chip } from '../../home/elements/index.style';
import {
	APPLICATION_STATUS_BADGES,
	EMPLOYMENT_TYPE_LABELS,
	OPENING_STATUS_BADGES,
	PROFILE_TYPE,
} from '../../../utilities/app-const';
import { formatDate, skillLabel } from '../../../utilities/basic-functions';
import { ROUTES } from '../../../utilities/app-routes';
import EligibilityGate from '../elements/eligibility-gate';
import { ListingCard } from '../elements/panels';
import {
	closesText,
	idOf,
	payText,
	placeText,
} from '../elements/listing-helpers';
import { SKILL_OPTIONS } from './elements/opening-schema';
import NearModal from './elements/near-modal';

const LIMIT = 12;
const VIEWS = [
	{ value: 'board', label: 'Job board' },
	{ value: 'applications', label: 'My applications' },
	{ value: 'postings', label: 'My postings' },
];
const RADII = [10, 25, 50, 100, 250, 500].map((km) => ({
	value: String(km),
	label: `Within ${km} km`,
}));

const openingPath = (id) => `${ROUTES.DASHBOARD_SITEFORCE}/${id}`;

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

function OpeningRow({ opening, showStatus }) {
	return (
		<ListingCard
			to={openingPath(opening.id)}
			title={opening.title}
			chips={
				<>
					<Chip>{skillLabel(opening.category)}</Chip>
					{opening.distanceKm != null && (
						<Chip $accent>{opening.distanceKm} km away</Chip>
					)}
				</>
			}
			facts={[
				placeText(opening.generalArea),
				EMPLOYMENT_TYPE_LABELS[opening.employmentType],
				`${opening.filledCount || 0} of ${opening.workersNeeded} filled`,
				opening.applicationDeadline &&
					closesText(opening.applicationDeadline, 'Closes'),
			]}
			aside={
				<>
					<span className="font-display text-lg font-semibold text-(--pg-text-primary)">
						{payText(opening)}
					</span>
					{showStatus && (
						<StatusBadge status={opening.status} map={OPENING_STATUS_BADGES} />
					)}
				</>
			}
		/>
	);
}

// The job board — eligible workers only (403 shows the gate). Plain
// filters, or "near" a point (?near=lat,lng&radius=km), nearest first.
function BoardView({ params, update }) {
	const nearRef = useRef(null);
	const [locating, setLocating] = useState(false);
	const [geoError, setGeoError] = useState('');
	const category = params.get('category') || '';
	const country = params.get('country') || '';
	const near = parseLatLng(params.get('near'));
	const radius = params.get('radius') || '50';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { data: countries = [] } = ReferenceServices.getCountries();
	const board = SiteForceServices.board({
		category,
		country,
		lat: near?.lat,
		lng: near?.lng,
		radiusKm: Number(radius),
		page,
		limit: LIMIT,
	});

	const searchNear = (point) =>
		update({ near: `${point.lat},${point.lng}`, page: '' });
	const nearMe = () => {
		if (!navigator.geolocation) return nearRef.current.open();
		setLocating(true);
		setGeoError('');
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocating(false);
				searchNear({
					lat: Math.round(pos.coords.latitude * 1e4) / 1e4,
					lng: Math.round(pos.coords.longitude * 1e4) / 1e4,
				});
			},
			() => {
				setLocating(false);
				setGeoError(
					'Couldn’t get your location — pick a place on the map instead.'
				);
				nearRef.current.open();
			},
			{ timeout: 10000 }
		);
	};

	if (board.isError && board.error?.response?.status === 403)
		return (
			<EligibilityGate
				profileType={PROFILE_TYPE.LABOR}
				action="browse and apply for site jobs"
				assumeBlocked
			/>
		);

	const openings = board.data?.data || [];
	const filtered = category || country || near;
	return (
		<>
			<div className="mb-3 flex flex-wrap items-end gap-3">
				<div className="w-full sm:w-55">
					<CustomSelect
						id="sf-category"
						label="Trade"
						placeholder="Any trade"
						clearable
						options={SKILL_OPTIONS}
						value={category}
						onChange={(v) => update({ category: v, page: '' })}
					/>
				</div>
				<div className="w-full sm:w-55">
					<CustomSelect
						id="sf-country"
						label="Country"
						placeholder="Any country"
						clearable
						options={countries.map((c) => ({
							value: c.isoCode,
							label: c.name,
						}))}
						value={country}
						onChange={(v) => update({ country: v, page: '' })}
					/>
				</div>
				{near ? (
					<>
						<div className="w-full sm:w-45">
							<CustomSelect
								id="sf-radius"
								label="Distance"
								options={RADII}
								value={radius}
								onChange={(v) =>
									update({ radius: v === '50' ? '' : v, page: '' })
								}
							/>
						</div>
						<AppButton
							variant="secondary"
							icon={<LuMapPin />}
							onClick={() => nearRef.current.open()}
						>
							Move
						</AppButton>
						<AppButton
							variant="secondary"
							icon={<LuX />}
							onClick={() => update({ near: '', radius: '', page: '' })}
						>
							Any distance
						</AppButton>
					</>
				) : (
					<>
						<AppButton
							icon={<LuCrosshair />}
							onClick={nearMe}
							disabled={locating}
						>
							{locating ? 'Locating…' : 'Near me'}
						</AppButton>
						<AppButton
							variant="secondary"
							icon={<LuMapPin />}
							onClick={() => nearRef.current.open()}
						>
							Near a place
						</AppButton>
					</>
				)}
			</div>
			{near && (
				<p className="mb-5 text-sm text-(--pg-text-secondary)">
					Nearest first, from {near.lat.toFixed(3)}, {near.lng.toFixed(3)}. Only
					jobs whose poster pinned the site show in a distance search.
				</p>
			)}
			{geoError && (
				<p className="mb-4 text-sm text-(--pg-status-error)">{geoError}</p>
			)}
			<div className={near ? '' : 'mt-5'}>
				{board.isPending ? (
					<Skeletons />
				) : board.isError ? (
					<LoadError refetch={board.refetch} what="the job board" />
				) : openings.length === 0 ? (
					<EmptyState
						icon={<LuSearchX />}
						title={filtered ? 'Nothing matches' : 'No open site jobs right now'}
						text={
							near
								? 'Try a wider distance, or search without a location.'
								: filtered
									? 'Try another trade or country.'
									: 'New jobs show here as soon as they’re posted.'
						}
						actions={
							filtered && (
								<AppButton
									variant="secondary"
									onClick={() =>
										update({
											category: '',
											country: '',
											near: '',
											radius: '',
											page: '',
										})
									}
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
						{openings.map((o) => (
							<li key={o.id}>
								<OpeningRow opening={o} />
							</li>
						))}
					</ul>
				)}
			</div>
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
			<NearModal refName={nearRef} value={near} onSearch={searchNear} />
		</>
	);
}

// One of my applications — the list carries a summary of its opening.
function ApplicationRow({ application }) {
	const posting =
		typeof application.posting === 'object' ? application.posting : null;
	return (
		<ListingCard
			to={openingPath(idOf(application.posting))}
			title={posting?.title || 'Site job'}
			facts={[
				posting?.generalArea && placeText(posting.generalArea),
				posting && payText(posting),
				`Applied ${formatDate(application.createdAt)}`,
			]}
			aside={
				<StatusBadge
					status={application.status}
					map={APPLICATION_STATUS_BADGES}
				/>
			}
		/>
	);
}

function ApplicationsView({ params, update }) {
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const apps = SiteForceServices.myApplications({ page, limit: LIMIT });
	const rows = apps.data?.data || [];

	if (apps.isPending) return <Skeletons />;
	if (apps.isError)
		return <LoadError refetch={apps.refetch} what="your applications" />;
	if (apps.data?.noProfile)
		return (
			<EligibilityGate
				profileType={PROFILE_TYPE.LABOR}
				action="apply for site jobs"
				assumeBlocked
			/>
		);
	if (!rows.length)
		return (
			<EmptyState
				tone="accent"
				icon={<LuHardHat />}
				title="No applications yet"
				text="Find a job on the board — near you, or by trade — and apply in one step."
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
				{rows.map((a) => (
					<li key={a.id}>
						<ApplicationRow application={a} />
					</li>
				))}
			</ul>
			{apps.data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={apps.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' })
						}
					/>
				</div>
			)}
		</>
	);
}

function PostingsView({ params, update }) {
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const mine = SiteForceServices.mine({ page, limit: LIMIT });
	const rows = mine.data?.data || [];

	if (mine.isPending) return <Skeletons />;
	if (mine.isError)
		return <LoadError refetch={mine.refetch} what="your postings" />;
	if (!rows.length)
		return (
			<EmptyState
				tone="accent"
				icon={<LuHardHat />}
				title="You haven’t posted a site job"
				text="Post what you need and verified workers nearby apply. Accept the ones you want."
				actions={
					<AppButton to={`${ROUTES.DASHBOARD_SITEFORCE}/new`} icon={<LuPlus />}>
						Post a site job
					</AppButton>
				}
			/>
		);
	return (
		<>
			<ul className="flex flex-col gap-3">
				{rows.map((o) => (
					<li key={o.id}>
						<OpeningRow opening={o} showStatus />
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

// frontend-plan §B.10 / §B.11 — SiteForce in the workspace: the job
// board and my applications (worker side), my postings (poster side).
// URL: ?view=board|applications|postings&category=&country=&near=&radius=&page=
function SiteForce() {
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

	const View = {
		board: BoardView,
		applications: ApplicationsView,
		postings: PostingsView,
	}[view];

	return (
		<>
			<PageHeader
				eyebrow="PolyGrid SiteForce"
				title="SiteForce"
				subtitle="Site work near you. Workers browse and apply; posters accept who they want, and each hire becomes a job with the pay in escrow."
				actions={
					<AppButton to={`${ROUTES.DASHBOARD_SITEFORCE}/new`} icon={<LuPlus />}>
						Post a site job
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

export default SiteForce;
