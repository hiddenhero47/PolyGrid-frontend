import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuBan,
	LuCloudOff,
	LuEye,
	LuEyeOff,
	LuInbox,
	LuMessageSquareText,
	LuRotateCw,
	LuSearch,
	LuTrash2,
	LuUndo2,
} from 'react-icons/lu';
import AdminModerationServices from '../../features/services/custom-hooks/admin-moderation';
import AdminServices from '../../features/services/custom-hooks/admin';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import Modal from '../../components/modal/index_modal';
import ConfirmModal from '../../components/modal/confirm-modal';
import ReasonModal from '../../components/modal/reason-modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import RatingStars from '../../components/rating-stars';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { CustomInput, CustomSelect } from '../../components/form-components';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import ProfileReview from '../verifications/elements/profile-review';
import UserSearch from '../elements/user-search';
import {
	MANAGE_ROLES,
	PROFILE_TYPE,
	PROFILE_TYPE_LABELS,
} from '../../utilities/app-const';
import { enumToOptions, formatDate } from '../../utilities/basic-functions';

const LIMIT = 10;
const PROFILE_OPTIONS = enumToOptions(PROFILE_TYPE, PROFILE_TYPE_LABELS);
const OBJECT_ID = /^[a-f\d]{24}$/i;
const TABS = [
	{ value: 'profiles', label: 'Profiles' },
	{ value: 'reviews', label: 'Reviews' },
];
const PROFILE_STATUS_BADGES = {
	active: { label: 'Active', tone: 'success' },
	inactive: { label: 'On a break', tone: 'neutral' },
	banned: { label: 'Banned', tone: 'error' },
};
const VISIBILITY = [
	{ value: '', label: 'All' },
	{ value: 'false', label: 'Visible' },
	{ value: 'true', label: 'Hidden' },
];

function Skeletons() {
	return (
		<div className="flex flex-col gap-4">
			{Array.from({ length: 3 }, (_, i) => (
				<SkeletonBar
					key={i}
					$width="100%"
					style={{ height: 110, borderRadius: 18 }}
				/>
			))}
		</div>
	);
}

// ── Profiles ──
function ProfilesTab({ params, update, canManage, onView, onReviews }) {
	const profileType = params.get('profileType') || '';
	const q = params.get('q') || '';
	const status = params.get('status') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const query = AdminModerationServices.profiles({
		profileType,
		q,
		status,
		page,
		limit: LIMIT,
	});
	const setStatus = AdminModerationServices.setProfileStatus();
	const reasonRef = useRef(null);
	const confirmRef = useRef(null);
	const [openType, setOpenType] = useState(PROFILE_TYPE.CONSULTANCY);
	const [openId, setOpenId] = useState('');
	const notAvailable = [404, 400].includes(query.error?.response?.status);
	const rows = query.data?.data || [];

	const ban = async (p) => {
		const reason = await reasonRef.current.ask({
			eyebrow: 'Ban profile',
			title: p.name || PROFILE_TYPE_LABELS[p.profileType],
			text: 'Its public page disappears straight away and it can’t be found or hired. The owner’s other profiles and account aren’t touched. You can unban it later.',
			label: 'Reason (optional — kept on the profile and sent to the owner)',
			confirmLabel: 'Ban profile',
		});
		if (reason === null) return;
		setStatus.mutate(
			{ profileType: p.profileType, id: p.id, status: 'banned', reason },
			{ onSuccess: () => toast.success('Profile banned') }
		);
	};

	const unban = async (p) => {
		const ok = await confirmRef.current.ask({
			title: 'Unban this profile?',
			text: 'It goes back to active — public again if it’s verified and its owner has a plan.',
			confirmLabel: 'Unban',
		});
		if (ok)
			setStatus.mutate(
				{ profileType: p.profileType, id: p.id, status: 'active' },
				{ onSuccess: () => toast.success('Profile unbanned') }
			);
	};

	return (
		<>
			<div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end">
				<UserSearch
					key={q}
					q={q}
					placeholder="Profile name, owner or email"
					onSearch={(v) => update({ q: v })}
				/>
				<div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-120">
					<CustomSelect
						id="mod-type"
						label="Profile type"
						placeholder="Any"
						variant="outline"
						clearable
						options={PROFILE_OPTIONS}
						value={profileType}
						onChange={(v) => update({ profileType: v })}
					/>
					<CustomSelect
						id="mod-status"
						label="Status"
						placeholder="Any"
						variant="outline"
						clearable
						options={Object.entries(PROFILE_STATUS_BADGES).map(
							([value, { label }]) => ({ value, label })
						)}
						value={status}
						onChange={(v) => update({ status: v })}
					/>
				</div>
			</div>

			{query.isPending ? (
				<Skeletons />
			) : notAvailable ? (
				<div className="flex flex-col gap-4 rounded-2xl border border-dashed border-(--pg-card-border) p-5">
					<p className="text-sm text-(--pg-text-secondary)">
						Profile search isn’t available yet. Open a profile by its ID — the
						long code in a verification or a job — or use “Moderate” on its
						public page.
					</p>
					<form
						className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-end"
						onSubmit={(e) => {
							e.preventDefault();
							if (!OBJECT_ID.test(openId.trim()))
								return toast.error('That isn’t a profile ID');
							onView({ profileType: openType, id: openId.trim() });
						}}
					>
						<CustomSelect
							id="open-type"
							label="Type"
							options={PROFILE_OPTIONS}
							value={openType}
							onChange={setOpenType}
						/>
						<CustomInput
							label="Profile ID"
							name="openId"
							value={openId}
							onChange={(e) => setOpenId(e.target.value)}
						/>
						<AppButton type="submit" icon={<LuSearch />}>
							Open
						</AppButton>
					</form>
				</div>
			) : query.isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load profiles"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			) : rows.length === 0 ? (
				<EmptyState icon={<LuInbox />} title="No profiles match" />
			) : (
				<ul className="flex flex-col gap-3">
					{rows.map((p) => (
						<li
							key={`${p.profileType}-${p.id}`}
							className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4"
						>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="truncate text-[15.5px] font-semibold text-(--pg-text-primary)">
										{p.name || 'Unnamed profile'}
									</span>
									<Chip>
										{PROFILE_TYPE_LABELS[p.profileType] || p.profileType}
									</Chip>
									{p.isVerified && <Chip $accent>Verified</Chip>}
								</div>
								<p className="mt-1 text-sm text-(--pg-text-secondary)">
									{[
										p.owner?.fullName,
										p.owner?.email,
										p.ratingCount
											? `${p.ratingAverage?.toFixed(1)}★ (${p.ratingCount})`
											: null,
									]
										.filter(Boolean)
										.join(' · ')}
								</p>
							</div>
							<StatusBadge status={p.status} map={PROFILE_STATUS_BADGES} />
							<div className="flex flex-wrap gap-2">
								<AppButton
									variant="secondary"
									icon={<LuEye />}
									onClick={() => onView(p)}
								>
									View
								</AppButton>
								<AppButton
									variant="secondary"
									icon={<LuMessageSquareText />}
									onClick={() => onReviews(p)}
								>
									Reviews
								</AppButton>
								{canManage &&
									(p.status === 'banned' ? (
										<AppButton
											variant="secondary"
											icon={<LuUndo2 />}
											onClick={() => unban(p)}
											disabled={setStatus.isPending}
										>
											Unban
										</AppButton>
									) : (
										<AppButton
											variant="secondary"
											icon={<LuBan />}
											onClick={() => ban(p)}
											disabled={setStatus.isPending}
										>
											Ban
										</AppButton>
									))}
							</div>
						</li>
					))}
				</ul>
			)}
			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination
						pagination={query.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' }, true)
						}
					/>
				</div>
			)}
			<ReasonModal refName={reasonRef} />
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

const tabProps = {
	params: PropTypes.object.isRequired,
	update: PropTypes.func.isRequired,
	canManage: PropTypes.bool,
	onView: PropTypes.func.isRequired,
};
ProfilesTab.propTypes = { ...tabProps, onReviews: PropTypes.func.isRequired };

// ── Reviews ──
function ReviewsTab({ params, update, canManage, onView }) {
	const profileType = params.get('profileType') || '';
	const profileId = params.get('profileId') || '';
	const isHidden = params.get('hidden') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const query = AdminModerationServices.reviews({
		profileType,
		profileId,
		isHidden,
		page,
		limit: LIMIT,
	});
	const hide = AdminModerationServices.hideReview();
	const unhide = AdminModerationServices.unhideReview();
	const remove = AdminModerationServices.deleteReview();
	const reasonRef = useRef(null);
	const confirmRef = useRef(null);
	// before the backend's platform-wide feed, it needs a profile
	const needsProfile = query.error?.response?.status === 400 && !profileId;
	// the backend filters by isHidden; until then, filter the page here
	const rows = (query.data?.data || []).filter(
		(r) => isHidden === '' || String(Boolean(r.isHidden)) === isHidden
	);

	const onHide = async (r) => {
		const reason = await reasonRef.current.ask({
			eyebrow: 'Hide review',
			title: `${r.rating}★ from ${r.reviewer?.fullName || 'a reviewer'}`,
			text: 'It leaves the public profile and its rating stops counting toward the average. You can unhide it later.',
			label: 'Reason (optional, staff only)',
			confirmLabel: 'Hide',
		});
		if (reason === null) return;
		hide.mutate(
			{ id: r.id, reason },
			{ onSuccess: () => toast.success('Review hidden') }
		);
	};

	const onDelete = async (r) => {
		const ok = await confirmRef.current.ask({
			title: 'Delete this review for good?',
			text: 'This is permanent — it can’t be restored, and the reviewer can’t review this profile for the same work again. To take it down for now, hide it instead.',
			confirmLabel: 'Delete permanently',
		});
		if (ok)
			remove.mutate(r.id, { onSuccess: () => toast.success('Review deleted') });
	};

	return (
		<>
			<div className="mb-5 flex flex-wrap items-end gap-3">
				<SegmentedControl
					label="Show"
					options={VISIBILITY}
					value={isHidden}
					onChange={(v) => update({ hidden: v })}
				/>
				{profileId && (
					<button
						type="button"
						onClick={() => update({ profileType: '', profileId: '' })}
						className="inline-flex items-center gap-2 rounded-full border border-(--pg-card-border) px-3 py-1.5 text-sm text-(--pg-text-primary) hover:border-(--pg-card-borderHover)"
					>
						One profile ({PROFILE_TYPE_LABELS[profileType] || profileType}) ·
						show all ✕
					</button>
				)}
			</div>

			{query.isPending ? (
				<Skeletons />
			) : needsProfile ? (
				<EmptyState
					icon={<LuMessageSquareText />}
					title="Pick a profile first"
					text="Find it on the Profiles tab and choose “Reviews” — a platform-wide review feed is on its way."
					actions={
						<AppButton onClick={() => update({ tab: '' })}>
							Go to Profiles
						</AppButton>
					}
				/>
			) : query.isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load reviews"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			) : rows.length === 0 ? (
				<EmptyState icon={<LuInbox />} title="No reviews here" />
			) : (
				<div className="flex flex-col gap-4">
					{rows.map((r) => {
						const reviewer =
							r.reviewer && typeof r.reviewer === 'object' ? r.reviewer : null;
						const hider =
							r.hiddenBy && typeof r.hiddenBy === 'object' ? r.hiddenBy : null;
						return (
							<ReviewCard key={r.id} aria-labelledby={`rev-${r.id}`}>
								<div className="sc_who">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-3">
											<RatingStars value={r.rating} size={15} />
											<h3 id={`rev-${r.id}`} className="sc_name">
												{reviewer?.fullName || 'Reviewer'}
											</h3>
										</div>
										<div className="sc_meta">
											{reviewer?.email && <span>{reviewer.email}</span>}
											<span>{formatDate(r.createdAt, true)}</span>
											{(r.profileName || r.profileType) && (
												<button
													type="button"
													className="text-(--pg-text-highlight) hover:underline"
													onClick={() =>
														onView({
															profileType: r.profileType,
															id: String(r.profileId),
														})
													}
												>
													on{' '}
													{r.profileName || PROFILE_TYPE_LABELS[r.profileType]}
												</button>
											)}
										</div>
									</div>
									<StatusBadge
										label={r.isHidden ? 'Hidden' : 'Visible'}
										tone={r.isHidden ? 'neutral' : 'success'}
									/>
								</div>
								<p className="text-[15px] whitespace-pre-line text-(--pg-text-primary)">
									{r.comment || (
										<span className="text-(--pg-text-secondary)">
											No comment.
										</span>
									)}
								</p>
								{r.isHidden && (
									<p className="text-sm text-(--pg-text-secondary)">
										Hidden {formatDate(r.hiddenAt, true)}
										{hider?.fullName ? ` by ${hider.fullName}` : ''}
										{r.hiddenReason ? ` — ${r.hiddenReason}` : ''}
									</p>
								)}
								{canManage && (
									<div className="flex flex-wrap gap-2">
										{r.isHidden ? (
											<AppButton
												variant="secondary"
												icon={<LuEye />}
												onClick={() =>
													unhide.mutate(r.id, {
														onSuccess: () => toast.success('Review restored'),
													})
												}
												disabled={unhide.isPending}
											>
												Unhide
											</AppButton>
										) : (
											<AppButton
												variant="secondary"
												icon={<LuEyeOff />}
												onClick={() => onHide(r)}
												disabled={hide.isPending}
											>
												Hide
											</AppButton>
										)}
										<AppButton
											variant="secondary"
											icon={<LuTrash2 />}
											onClick={() => onDelete(r)}
											disabled={remove.isPending}
										>
											Delete…
										</AppButton>
									</div>
								)}
							</ReviewCard>
						);
					})}
				</div>
			)}
			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination
						pagination={query.data.pagination}
						changePage={(next) =>
							update({ page: next > 1 ? String(next) : '' }, true)
						}
					/>
				</div>
			)}
			<ReasonModal refName={reasonRef} />
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

ReviewsTab.propTypes = tabProps;

// Ban / unban from the profile drawer (works for a profile opened by ID).
function DrawerActions({ profile, canManage }) {
	const { data } = AdminServices.getProfileForReview({
		profileType: profile.profileType,
		id: String(profile.id),
	});
	const setStatus = AdminModerationServices.setProfileStatus();
	const reasonRef = useRef(null);
	const status = data?.status;
	if (!canManage || !status) return null;
	const run = async (next) => {
		const reason =
			next === 'banned'
				? await reasonRef.current.ask({
						eyebrow: 'Ban profile',
						title: 'Ban this profile?',
						text: 'Its public page disappears straight away. You can unban it later.',
						label: 'Reason (optional)',
						confirmLabel: 'Ban profile',
					})
				: '';
		if (reason === null) return;
		setStatus.mutate(
			{
				profileType: profile.profileType,
				id: String(profile.id),
				status: next,
				reason,
			},
			{
				onSuccess: () =>
					toast.success(
						next === 'banned' ? 'Profile banned' : 'Profile unbanned'
					),
			}
		);
	};
	return (
		<>
			{status === 'banned' ? (
				<AppButton
					variant="secondary"
					icon={<LuUndo2 />}
					onClick={() => run('active')}
					disabled={setStatus.isPending}
				>
					Unban
				</AppButton>
			) : (
				<AppButton
					variant="secondary"
					icon={<LuBan />}
					onClick={() => run('banned')}
					disabled={setStatus.isPending}
				>
					Ban profile
				</AppButton>
			)}
			<ReasonModal refName={reasonRef} />
		</>
	);
}

DrawerActions.propTypes = {
	profile: PropTypes.object.isRequired,
	canManage: PropTypes.bool,
};

// frontend-plan §C.3 / §C.3b — Moderation. Profiles: find any profile
// (any status) and ban / unban it — a ban hides its public page. Reviews:
// hide (reversible, backs the rating out) / unhide / delete (permanent).
// Every review role can look; only admin / super_admin act.
// URL: ?tab=profiles|reviews&profileType=&q=&status=&profileId=&hidden=&page=
function Moderation() {
	const [params, setParams] = useSearchParams();
	const tab = params.get('tab') === 'reviews' ? 'reviews' : 'profiles';
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const drawerRef = useRef(null);
	const [viewing, setViewing] = useState(null);

	// changes merge into the URL; any filter change goes back to page 1
	const update = (changes, keepPage = false) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([k, v]) =>
			v ? next.set(k, v) : next.delete(k)
		);
		if (!keepPage && !('page' in changes)) next.delete('page');
		setParams(next);
	};

	const view = (p) => {
		setViewing(p);
		drawerRef.current.open();
	};
	const reviewsOf = (p) =>
		setParams({
			tab: 'reviews',
			profileType: p.profileType,
			profileId: String(p.id),
		});

	return (
		<>
			<PageHeader
				eyebrow="Review queues"
				title="Moderation"
				subtitle="Ban a profile that breaks the rules, and keep reviews honest — hide unfair ones (reversible) or delete them for good."
			/>
			<div className="mb-6">
				<SegmentedControl
					label="Moderate"
					options={TABS}
					value={tab}
					onChange={(v) => setParams(v === 'profiles' ? {} : { tab: v })}
				/>
			</div>
			{tab === 'reviews' ? (
				<ReviewsTab
					params={params}
					update={update}
					canManage={canManage}
					onView={view}
				/>
			) : (
				<ProfilesTab
					params={params}
					update={update}
					canManage={canManage}
					onView={view}
					onReviews={reviewsOf}
				/>
			)}
			<Modal.Right
				refName={drawerRef}
				width="520px"
				queryWidth="100%"
				onClose={() => setViewing(null)}
			>
				<Modal.Card
					eyebrow={
						viewing ? PROFILE_TYPE_LABELS[viewing.profileType] : 'Profile'
					}
					title="Profile"
				>
					{viewing && (
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap gap-2">
								<AppButton
									variant="secondary"
									icon={<LuMessageSquareText />}
									onClick={() => {
										drawerRef.current.close();
										reviewsOf(viewing);
									}}
								>
									See its reviews
								</AppButton>
								<DrawerActions profile={viewing} canManage={canManage} />
							</div>
							<ProfileReview
								profileType={viewing.profileType}
								profileId={String(viewing.id)}
							/>
						</div>
					)}
				</Modal.Card>
			</Modal.Right>
		</>
	);
}

export default Moderation;
