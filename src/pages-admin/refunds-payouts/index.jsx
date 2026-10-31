import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuCheck,
	LuCloudOff,
	LuEye,
	LuPartyPopper,
	LuRotateCw,
	LuX,
} from 'react-icons/lu';
import AdminMoneyServices from '../../features/services/custom-hooks/admin-money';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import Modal from '../../components/modal/index_modal';
import ConfirmModal from '../../components/modal/confirm-modal';
import ReasonModal from '../../components/modal/reason-modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import JobReview from '../elements/job-review';
import { MANAGE_ROLES } from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';

const LIMIT = 10;
const idOf = (v) => String(v?._id || v?.id || v || '');
const who = (party) =>
	typeof party?.userId === 'object' ? party.userId : null;

// What each tab is about: who asks, how the amount is worked out, what
// approving does.
const KINDS = {
	refunds: {
		label: 'Refunds',
		request: (row) => row.refund,
		amount: (row) => row.refundable,
		requester: 'client',
		other: 'provider',
		amountLabel: 'Refundable now',
		why: (r) => r?.reason,
		approveText: (row, amount) =>
			`${formatMoney(amount)} still in escrow goes back to the client, and the job closes. It’s recorded as money owed to their payout account — make the transfer from there.`,
		empty: 'No refund requests waiting.',
	},
	payouts: {
		label: 'Payouts',
		request: (row) => row.payout,
		amount: (row) => row.available,
		requester: 'provider',
		other: 'client',
		amountLabel: 'Available to pay out',
		why: (r) => r?.note,
		approveText: (row, amount) =>
			`${formatMoney(amount)} released for verified stages is recorded as owed to the provider’s payout account — make the transfer from there.`,
		empty: 'No payout requests waiting.',
	},
};

// frontend-plan §C.8 / §C.9 — refund requests (clients) and payout
// requests (providers), one pending per job. The backend works out the
// amount when it's approved (what's refundable / available then), and
// refuses if the recipient has no payout account. Every review role sees
// the queues; admin / super_admin decide. URL: ?tab=refunds|payouts&page=
function RefundsPayouts() {
	const [params, setParams] = useSearchParams();
	const tab = params.get('tab') === 'payouts' ? 'payouts' : 'refunds';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const kind = KINDS[tab];
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);

	const refunds = AdminMoneyServices.refundRequests({
		page: tab === 'refunds' ? page : 1,
		limit: LIMIT,
	});
	const payouts = AdminMoneyServices.payoutRequests({
		page: tab === 'payouts' ? page : 1,
		limit: LIMIT,
	});
	const query = tab === 'refunds' ? refunds : payouts;
	const approveRefund = AdminMoneyServices.approveRefund();
	const declineRefund = AdminMoneyServices.declineRefund();
	const approvePayout = AdminMoneyServices.approvePayout();
	const declinePayout = AdminMoneyServices.declinePayout();
	const approve = tab === 'refunds' ? approveRefund : approvePayout;
	const decline = tab === 'refunds' ? declineRefund : declinePayout;

	const confirmRef = useRef(null);
	const reasonRef = useRef(null);
	const drawerRef = useRef(null);
	const [viewing, setViewing] = useState(null);
	const rows = query.data?.data || [];

	const count = (q) => q.data?.pagination?.total;
	const tabs = [
		{
			value: 'refunds',
			label: count(refunds) ? `Refunds (${count(refunds)})` : 'Refunds',
		},
		{
			value: 'payouts',
			label: count(payouts) ? `Payouts (${count(payouts)})` : 'Payouts',
		},
	];

	const onApprove = async (row) => {
		const amount = kind.amount(row);
		const ok = await confirmRef.current.ask({
			title: `Approve this ${tab === 'refunds' ? 'refund' : 'payout'}?`,
			text: kind.approveText(row, amount),
			confirmLabel: 'Approve',
		});
		if (!ok) return;
		approve.mutate(
			{ jobId: idOf(row.jobId), requestId: idOf(kind.request(row)) },
			{
				onSuccess: () =>
					toast.success('Approved — the requester has been emailed'),
			}
		);
	};

	const onDecline = async (row) => {
		const declineReason = await reasonRef.current.ask({
			eyebrow: `Decline ${tab === 'refunds' ? 'refund' : 'payout'}`,
			title: row.jobTitle,
			text: 'The requester is emailed this reason. They can ask again later.',
			label: 'Reason',
			required: true,
			confirmLabel: 'Decline',
		});
		if (declineReason)
			decline.mutate(
				{
					jobId: idOf(row.jobId),
					requestId: idOf(kind.request(row)),
					declineReason,
				},
				{
					onSuccess: () =>
						toast.success('Declined — the requester has been emailed'),
				}
			);
	};

	const view = (row) => {
		setViewing(row);
		drawerRef.current.open();
	};

	return (
		<>
			<PageHeader
				eyebrow="Billing"
				title="Refunds & payouts"
				subtitle="Clients ask for what’s still in escrow back; providers ask for what’s been released to them. Approving records the money as owed to their payout account."
			/>
			<div className="mb-6">
				<SegmentedControl
					label="Queue"
					options={tabs}
					value={tab}
					onChange={(value) =>
						setParams(value === 'refunds' ? {} : { tab: value })
					}
				/>
			</div>

			{query.isPending && (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 130, borderRadius: 18 }}
						/>
					))}
				</div>
			)}

			{query.isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load the queue"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			)}

			{!query.isPending && !query.isError && rows.length === 0 && (
				<EmptyState
					tone="success"
					icon={<LuPartyPopper />}
					title="Queue is clear"
					text={kind.empty}
				/>
			)}

			{rows.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: query.isFetching && !query.isPending ? 0.6 : 1 }}
				>
					{rows.map((row) => {
						const request = kind.request(row);
						const requester = who(row[kind.requester]);
						const other = who(row[kind.other]);
						const amount = kind.amount(row);
						const reason = kind.why(request);
						return (
							<ReviewCard
								key={idOf(request) || idOf(row.jobId)}
								aria-labelledby={`req-${idOf(request)}`}
							>
								<div className="sc_who">
									<div className="min-w-0 flex-1">
										<h3 id={`req-${idOf(request)}`} className="sc_name">
											{row.jobTitle}
										</h3>
										<div className="sc_meta">
											<span>
												Asked by{' '}
												<strong className="text-(--pg-text-primary)">
													{requester?.fullName || 'the ' + kind.requester}
												</strong>{' '}
												(the {kind.requester})
											</span>
											{requester?.email && (
												<a
													href={`mailto:${requester.email}`}
													className="text-(--pg-text-highlight) hover:underline"
												>
													{requester.email}
												</a>
											)}
											<span>{formatDate(request?.requestedAt, true)}</span>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs text-(--pg-text-secondary)">
											{kind.amountLabel}
										</p>
										<p className="font-display text-2xl font-semibold text-(--pg-text-primary)">
											{formatMoney(amount || 0)}
										</p>
									</div>
								</div>

								{reason ? (
									<p className="rounded-xl bg-(--pg-surface-card) p-4 text-[15px] whitespace-pre-line text-(--pg-text-primary)">
										{reason}
									</p>
								) : (
									<p className="text-sm text-(--pg-text-secondary)">No note.</p>
								)}

								<p className="text-sm text-(--pg-text-secondary)">
									Other side: {other?.fullName || '—'}
									{other?.email ? ` · ${other.email}` : ''}
								</p>

								{amount <= 0 && (
									<p className="text-sm font-semibold text-(--pg-status-warning)">
										Nothing is{' '}
										{tab === 'refunds'
											? 'left to refund'
											: 'available to pay out'}{' '}
										right now — approving will fail; decline or wait.
									</p>
								)}

								<div className="flex flex-wrap gap-2">
									<AppButton
										variant="secondary"
										icon={<LuEye />}
										onClick={() => view(row)}
									>
										Open job
									</AppButton>
									{canManage && (
										<>
											<AppButton
												icon={<LuCheck />}
												onClick={() => onApprove(row)}
												disabled={approve.isPending || amount <= 0}
											>
												Approve {formatMoney(amount || 0)}
											</AppButton>
											<AppButton
												variant="secondary"
												icon={<LuX />}
												onClick={() => onDecline(row)}
												disabled={decline.isPending}
											>
												Decline
											</AppButton>
										</>
									)}
								</div>
								{canManage && (
									<p className="text-xs text-(--pg-text-secondary)">
										The {kind.requester} needs a payout account in their
										settings — approving tells you if it’s missing.
									</p>
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
							setParams({
								...(tab === 'payouts' && { tab }),
								...(next > 1 && { page: String(next) }),
							})
						}
					/>
				</div>
			)}

			<Modal.Right
				refName={drawerRef}
				width="560px"
				queryWidth="100%"
				onClose={() => setViewing(null)}
			>
				<Modal.Card eyebrow="Job" title="Job details">
					{viewing && (
						<JobReview jobId={idOf(viewing.jobId)} fallback={viewing} />
					)}
				</Modal.Card>
			</Modal.Right>
			<ConfirmModal refName={confirmRef} />
			<ReasonModal refName={reasonRef} />
		</>
	);
}

export default RefundsPayouts;
