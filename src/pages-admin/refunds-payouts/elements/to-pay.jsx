import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
	LuBan,
	LuCheck,
	LuCloudOff,
	LuCopy,
	LuEye,
	LuPartyPopper,
	LuRotateCw,
} from 'react-icons/lu';
import AdminMoneyServices from '../../../features/services/custom-hooks/admin-money';
import { toast } from '../../../layouts/toast/toast-handler';
import ReasonModal from '../../../components/modal/reason-modal';
import EmptyState from '../../../components/empty-state';
import Pagination from '../../../components/pagination';
import StatusBadge from '../../../components/status-badge';
import SegmentedControl from '../../../components/segmented-control';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import { ReviewCard } from '../../verifications/elements/index.style';
import {
	countryName,
	formatDate,
	formatMoney,
} from '../../../utilities/basic-functions';

const STATUSES = [
	{ value: 'pending', label: 'To pay' },
	{ value: 'paid', label: 'Paid' },
	{ value: 'failed', label: 'Failed' },
];
const STATUS_BADGES = {
	pending: { label: 'To pay', tone: 'warning' },
	paid: { label: 'Paid', tone: 'success' },
	failed: { label: 'Failed', tone: 'error' },
};

const copy = (text) =>
	navigator.clipboard?.writeText(text).then(
		() => toast.success('Copied'),
		() => toast.error('Couldn’t copy')
	);

// Money PolyGrid owes after an approved refund or payout (admin / super
// admin). Nothing pays automatically yet: an admin makes the bank transfer
// to the account details captured at approval, then marks it paid (with
// the bank's reference) or failed (with why). The recipient is emailed
// either way.
function ToPay({ status, page, onStatus, onPage, onOpenJob }) {
	const query = AdminMoneyServices.systemPayouts({ status, page, limit: 10 });
	const markPaid = AdminMoneyServices.markPaid();
	const markFailed = AdminMoneyServices.markFailed();
	const reasonRef = useRef(null);
	const rows = query.data?.data || [];

	const onPaid = async (row) => {
		const transferReference = await reasonRef.current.ask({
			eyebrow: 'Mark as paid',
			title: `${formatMoney(row.amount, row.currency)} to ${row.recipient?.fullName || 'the recipient'}`,
			text: 'Only once the transfer has actually gone out. Add the bank’s reference so it can be traced later — the recipient sees it in their email.',
			label: 'Transfer reference (optional)',
			confirmLabel: 'Mark paid',
		});
		if (transferReference === null) return;
		markPaid.mutate(
			{ id: row.id, transferReference },
			{
				onSuccess: () =>
					toast.success('Marked paid — the recipient has been emailed'),
			}
		);
	};

	const onFailed = async (row) => {
		const failureReason = await reasonRef.current.ask({
			eyebrow: 'Mark as failed',
			title: `${formatMoney(row.amount, row.currency)} to ${row.recipient?.fullName || 'the recipient'}`,
			text: 'The recipient is emailed this reason — e.g. the account number was rejected, so they should update their payout account.',
			label: 'What went wrong',
			required: true,
			confirmLabel: 'Mark failed',
		});
		if (failureReason)
			markFailed.mutate(
				{ id: row.id, failureReason },
				{
					onSuccess: () =>
						toast.success('Marked failed — the recipient has been emailed'),
				}
			);
	};

	return (
		<>
			<div className="mb-5">
				<SegmentedControl
					label="Transfers"
					options={STATUSES}
					value={status}
					onChange={onStatus}
				/>
			</div>

			{query.isPending && (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 2 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 150, borderRadius: 18 }}
						/>
					))}
				</div>
			)}

			{query.isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load transfers"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			)}

			{!query.isPending && !query.isError && rows.length === 0 && (
				<EmptyState
					tone={status === 'pending' ? 'success' : 'neutral'}
					icon={<LuPartyPopper />}
					title={status === 'pending' ? 'Nothing to pay' : 'None yet'}
					text={
						status === 'pending'
							? 'Approved refunds and payouts show here until they’re paid.'
							: undefined
					}
				/>
			)}

			{rows.length > 0 && (
				<div className="flex flex-col gap-4">
					{rows.map((row) => {
						const acct = row.payoutAccount || {};
						return (
							<ReviewCard key={row.id} aria-labelledby={`sp-${row.id}`}>
								<div className="sc_who">
									<div className="min-w-0 flex-1">
										<h3 id={`sp-${row.id}`} className="sc_name">
											{row.requestType === 'refund' ? 'Refund' : 'Payout'} to{' '}
											{row.recipient?.fullName || 'recipient'}
										</h3>
										<div className="sc_meta">
											{row.recipient?.email && (
												<a
													href={`mailto:${row.recipient.email}`}
													className="text-(--pg-text-highlight) hover:underline"
												>
													{row.recipient.email}
												</a>
											)}
											<span>{row.jobTitle || 'Job'}</span>
											<span>Approved {formatDate(row.createdAt, true)}</span>
										</div>
									</div>
									<div className="flex flex-col items-end gap-1.5">
										<span className="font-display text-2xl font-semibold text-(--pg-text-primary)">
											{formatMoney(row.amount, row.currency)}
										</span>
										<StatusBadge status={row.status} map={STATUS_BADGES} />
									</div>
								</div>

								<dl className="grid gap-3 rounded-xl bg-(--pg-surface-card) p-4 text-sm sm:grid-cols-2">
									<div>
										<dt className="text-xs text-(--pg-text-secondary)">
											Account name
										</dt>
										<dd className="font-semibold text-(--pg-text-primary)">
											{acct.accountName || '—'}
										</dd>
									</div>
									<div>
										<dt className="text-xs text-(--pg-text-secondary)">
											Account number
										</dt>
										<dd className="inline-flex items-center gap-2 font-semibold text-(--pg-text-primary)">
											{acct.accountNumber || '—'}
											{acct.accountNumber && (
												<button
													type="button"
													onClick={() => copy(acct.accountNumber)}
													aria-label="Copy account number"
													className="text-(--pg-text-secondary) hover:text-(--pg-text-primary)"
												>
													<LuCopy aria-hidden="true" />
												</button>
											)}
										</dd>
									</div>
									<div>
										<dt className="text-xs text-(--pg-text-secondary)">Bank</dt>
										<dd className="font-semibold text-(--pg-text-primary)">
											{acct.bankName || '—'}
											{acct.bankCode ? ` · ${acct.bankCode}` : ''}
										</dd>
									</div>
									<div>
										<dt className="text-xs text-(--pg-text-secondary)">
											Country
										</dt>
										<dd className="font-semibold text-(--pg-text-primary)">
											{countryName(acct.country) || '—'}
										</dd>
									</div>
								</dl>
								<p className="text-xs text-(--pg-text-secondary)">
									Account details as they were when the request was approved.
								</p>

								{row.transferReference && (
									<p className="text-sm text-(--pg-text-primary)">
										Reference: {row.transferReference}
									</p>
								)}
								{row.failureReason && (
									<p className="text-sm text-(--pg-status-error)">
										Failed: {row.failureReason}
									</p>
								)}

								<div className="flex flex-wrap gap-2">
									<AppButton
										variant="secondary"
										icon={<LuEye />}
										onClick={() => onOpenJob(String(row.targetId))}
									>
										Open job
									</AppButton>
									{row.status === 'pending' && (
										<>
											<AppButton
												icon={<LuCheck />}
												onClick={() => onPaid(row)}
												disabled={markPaid.isPending}
											>
												Mark paid
											</AppButton>
											<AppButton
												variant="secondary"
												icon={<LuBan />}
												onClick={() => onFailed(row)}
												disabled={markFailed.isPending}
											>
												Mark failed
											</AppButton>
										</>
									)}
								</div>
							</ReviewCard>
						);
					})}
				</div>
			)}

			{query.data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination pagination={query.data.pagination} changePage={onPage} />
				</div>
			)}
			<ReasonModal refName={reasonRef} />
		</>
	);
}

ToPay.propTypes = {
	status: PropTypes.string.isRequired,
	page: PropTypes.number.isRequired,
	onStatus: PropTypes.func.isRequired,
	onPage: PropTypes.func.isRequired,
	onOpenJob: PropTypes.func.isRequired,
};

export default ToPay;
