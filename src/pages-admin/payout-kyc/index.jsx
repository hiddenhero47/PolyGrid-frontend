import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
	LuCheck,
	LuX,
	LuImage,
	LuMail,
	LuMapPin,
	LuClock,
	LuPartyPopper,
	LuInbox,
	LuCloudOff,
	LuRotateCw,
	LuFingerprint,
} from 'react-icons/lu';
import PayoutKycServices from '../../features/services/custom-hooks/payout-kyc';
import AdminServices from '../../features/services/custom-hooks/admin';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import ConfirmModal from '../../components/modal/confirm-modal';
import ReasonModal from '../../components/modal/reason-modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import SegmentedControl from '../../components/segmented-control';
import ProfileAvatar from '../../components/profile-avatar';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import {
	MANAGE_ROLES,
	PAYOUT_KYC_BADGES,
	PAYOUT_KYC_STATUS,
} from '../../utilities/app-const';
import { countryName, formatDate } from '../../utilities/basic-functions';

const LIMIT = 10;
const TABS = [
	{ value: 'pending', label: 'Awaiting review' },
	{ value: 'verified', label: 'Verified' },
	{ value: 'failed', label: 'Not verified' },
];
const DOCUMENTS = [
	{ type: 'idFront', label: 'ID front' },
	{ type: 'idBack', label: 'ID back' },
	{ type: 'face', label: 'Face' },
];

// Payout identity: before any refund or payout to a person can be
// approved, they need a verified check. Number checks (BVN / NIN) are
// decided at once by the provider; ID photos wait here for an admin.
// GET /api/payout-kyc?status=, PATCH /:id/approve | /:id/reject.
// Customer care sees the queue, only admins decide.
// URL: ?status=pending|verified|failed&page=
function PayoutKycQueue() {
	const { user: me } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(me?.systemRole);
	const [params, setParams] = useSearchParams();
	const status = TABS.some((t) => t.value === params.get('status'))
		? params.get('status')
		: 'pending';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const confirmRef = useRef(null);
	const reasonRef = useRef(null);

	const { data, isPending, isError, isFetching, refetch } =
		PayoutKycServices.getRecords({ status, page, limit: LIMIT });
	const decide = PayoutKycServices.decide();
	const fileLink = AdminServices.getFileLink();
	const items = data?.data || [];

	// The signed link is fetched on click; the tab is opened first so popup
	// blockers allow it, then pointed at the file.
	const openDocument = (ownerId, doc) => {
		const tab = window.open('', '_blank');
		fileLink.mutate(
			{ ownerId, fileName: doc.fileName },
			{
				onSuccess: ({ requestUrl }) => {
					if (tab) {
						tab.opener = null;
						tab.location.href = requestUrl;
					} else window.open(requestUrl, '_blank', 'noopener');
				},
				onError: () => tab?.close(),
			}
		);
	};

	const approve = async (record, name) => {
		const ok = await confirmRef.current.ask({
			title: `Verify ${name}?`,
			text: 'Approve only if the ID looks genuine, both sides match, and the face photo is the same person. Refunds and payouts to them can then be approved.',
			confirmLabel: 'Verify',
		});
		if (!ok) return;
		decide.mutate(
			{ id: record._id, approve: true },
			{ onSuccess: () => toast.success(`${name} is verified for payouts`) }
		);
	};

	const reject = async (record, name) => {
		const reason = await reasonRef.current.ask({
			eyebrow: 'Payout identity',
			title: `Reject ${name}’s photos?`,
			text: 'They’re told this reason and can send new photos.',
			label: 'What’s wrong',
			required: true,
			confirmLabel: 'Reject',
		});
		if (!reason) return;
		decide.mutate(
			{ id: record._id, approve: false, rejectionReason: reason },
			{ onSuccess: () => toast.success('Rejected — they’ve been told why') }
		);
	};

	return (
		<>
			<PageHeader
				eyebrow="Review queue"
				title="Payout identity"
				subtitle="Check that refunds and payouts go to the right person. Number checks are decided automatically; ID photos wait here for you."
			/>

			<div className="mb-6">
				<SegmentedControl
					label="Status"
					options={TABS}
					value={status}
					onChange={(value) =>
						setParams(value === 'pending' ? {} : { status: value })
					}
				/>
			</div>

			{isPending && (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<div
							key={i}
							className="flex flex-col gap-3 rounded-[18px] border border-(--pg-card-border) p-5"
						>
							<SkeletonBar $width="40%" />
							<SkeletonBar $width="70%" />
						</div>
					))}
				</div>
			)}

			{isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load the queue"
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
					tone={status === 'pending' ? 'success' : 'neutral'}
					icon={status === 'pending' ? <LuPartyPopper /> : <LuInbox />}
					title={status === 'pending' ? 'Queue is clear' : 'Nothing here yet'}
					text={
						status === 'pending'
							? 'No ID photos are waiting for review.'
							: undefined
					}
				/>
			)}

			{items.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: isFetching && !isPending ? 0.6 : 1 }}
				>
					{items.map((record) => {
						const person =
							record.user && typeof record.user === 'object' ? record.user : {};
						const ownerId = person._id || person.id || record.user;
						const name = person.fullName || 'This person';
						const isDocument = record.method === 'document';
						const reviewable =
							canManage &&
							isDocument &&
							record.status === PAYOUT_KYC_STATUS.PENDING;
						const badge = PAYOUT_KYC_BADGES[record.status] || {};
						return (
							<ReviewCard
								key={record._id}
								aria-labelledby={`kyc-${record._id}`}
							>
								<div className="sc_who">
									<ProfileAvatar name={person.fullName} size={48} />
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2.5">
											<h3 id={`kyc-${record._id}`} className="sc_name">
												{person.fullName || `User ${String(ownerId).slice(-6)}`}
											</h3>
											<Chip $accent>
												{isDocument
													? 'ID photos'
													: `${(record.idType || 'ID').toUpperCase()} check`}
											</Chip>
										</div>
										<div className="sc_meta">
											{person.email && (
												<span>
													<LuMail aria-hidden="true" /> {person.email}
												</span>
											)}
											{record.country && (
												<span>
													<LuMapPin aria-hidden="true" />{' '}
													{countryName(record.country)}
												</span>
											)}
											<span>
												<LuClock aria-hidden="true" /> Sent{' '}
												{formatDate(record.updatedAt || record.createdAt, true)}
											</span>
										</div>
									</div>
									<StatusBadge
										label={badge.label || record.status}
										tone={badge.tone || 'neutral'}
									/>
								</div>

								{!isDocument && (
									<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
										<LuFingerprint aria-hidden="true" />
										{(record.idType || 'ID').toUpperCase()} ending{' '}
										{record.last4 || '—'}
										{record.provider && ` · checked by ${record.provider}`}
									</p>
								)}

								{isDocument && (
									<ul className="flex flex-wrap gap-2">
										{DOCUMENTS.map(({ type, label }) => {
											const doc = record.documents?.[type];
											return (
												<li key={type}>
													<button
														type="button"
														disabled={!doc || fileLink.isPending}
														onClick={() => openDocument(ownerId, doc)}
														className="inline-flex items-center gap-2 rounded-lg border border-(--pg-chip-border) bg-(--pg-chip-background) px-3 py-1.5 text-sm text-(--pg-chip-text) hover:border-(--pg-card-borderHover) disabled:cursor-not-allowed disabled:opacity-60"
													>
														<LuImage
															className="text-(--pg-text-highlight)"
															aria-hidden="true"
														/>
														{doc ? label : `${label} missing`}
													</button>
												</li>
											);
										})}
									</ul>
								)}

								{(record.rejectionReason || record.failureReason) &&
									record.status === PAYOUT_KYC_STATUS.FAILED && (
										<p className="text-sm text-(--pg-text-secondary)">
											Reason: {record.rejectionReason || record.failureReason}
										</p>
									)}

								{reviewable && (
									<div className="sc_actions">
										<div className="ml-auto flex flex-wrap gap-2.5">
											<AppButton
												size="sm"
												variant="secondary"
												icon={<LuX />}
												onClick={() => reject(record, name)}
												disabled={decide.isPending}
											>
												Reject
											</AppButton>
											<AppButton
												size="sm"
												icon={<LuCheck />}
												onClick={() => approve(record, name)}
												disabled={decide.isPending}
											>
												Verify
											</AppButton>
										</div>
									</div>
								)}
							</ReviewCard>
						);
					})}
				</div>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination
						pagination={data.pagination}
						changePage={(next) =>
							setParams({
								...(status !== 'pending' && { status }),
								...(next > 1 && { page: String(next) }),
							})
						}
					/>
				</div>
			)}

			<ConfirmModal refName={confirmRef} />
			<ReasonModal refName={reasonRef} />
		</>
	);
}

export default PayoutKycQueue;
