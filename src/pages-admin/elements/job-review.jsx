import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LuDownload, LuEye, LuLock, LuReceipt } from 'react-icons/lu';
import AdminMoneyServices from '../../features/services/custom-hooks/admin-money';
import { toast } from '../../layouts/toast/toast-handler';
import AppLoader from '../../components/loader';
import StatusBadge from '../../components/status-badge';
import ConfirmModal from '../../components/modal/confirm-modal';
import { AppButton } from '../../components/button';
import { CustomInput } from '../../components/form-components';
import {
	JOB_STATUS_BADGES,
	JOB_TYPE_LABELS,
	MANAGE_ROLES,
	PAYMENT_STATUS_BADGES,
} from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';

const REQUEST_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	approved: { label: 'Approved', tone: 'success' },
	declined: { label: 'Declined', tone: 'error' },
};

const label =
	'font-label mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase';

// populated { fullName, email } (queues) or the job's { user } summary
const person = (party) => {
	const u = typeof party?.userId === 'object' ? party.userId : party?.user;
	return { name: u?.fullName || 'Unknown', email: u?.email };
};

function Fact({ name, value }) {
	return (
		<div>
			<dt className="text-xs text-(--pg-text-secondary)">{name}</dt>
			<dd className="font-semibold text-(--pg-text-primary)">{value}</dd>
		</div>
	);
}

Fact.propTypes = { name: PropTypes.node, value: PropTypes.node };

// The money and history of one job, for whoever is deciding a dispute,
// refund or payout (frontend-plan §C.7–C.11). Full detail needs admin /
// super_admin (GET /api/jobs/:id); customer care sees the queue row's
// parties plus the job's payments (GET /api/jobs/:id/payments).
function JobReview({ jobId, fallback }) {
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const jobQuery = AdminMoneyServices.job(jobId);
	const payments = AdminMoneyServices.jobPayments(jobId);
	const record = AdminMoneyServices.recordPayment();
	const confirmRef = useRef(null);
	const [amount, setAmount] = useState('');

	const job = jobQuery.data;
	const blocked = jobQuery.error?.response?.status === 403;
	const source = job || fallback || {};
	const client = person(source.client);
	const provider = person(source.provider);
	const currency = job?.currency || 'USD';
	const held = job
		? Math.max(
				(job.amountPaid || 0) -
					(job.amountDisbursed || 0) -
					(job.platformFeeCollected || 0) -
					(job.totalRefunded || 0),
				0
			)
		: 0;

	const onRecord = async (e) => {
		e.preventDefault();
		const value = Math.round(Number(amount) * 100) / 100;
		if (!(value > 0)) return toast.error('Enter the amount received');
		const ok = await confirmRef.current.ask({
			title: `Record ${formatMoney(value, currency)} as paid?`,
			text: 'Only for money the client paid outside Stripe (e.g. a bank transfer you’ve confirmed). It adds to what’s funded in escrow and can’t be undone here.',
			confirmLabel: 'Record payment',
		});
		if (ok)
			record.mutate(
				{ id: jobId, amount: value },
				{
					onSuccess: () => {
						setAmount('');
						toast.success('Payment recorded');
					},
				}
			);
	};

	if (jobQuery.isPending && !fallback)
		return <AppLoader showLabel label="Loading job" />;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<div className="flex flex-wrap items-center gap-2">
					{job?.status && (
						<StatusBadge status={job.status} map={JOB_STATUS_BADGES} />
					)}
					{job?.jobType && (
						<span className="text-sm text-(--pg-text-secondary)">
							{JOB_TYPE_LABELS[job.jobType] || job.jobType}
						</span>
					)}
				</div>
				<h3 className="mt-2 text-lg font-semibold text-(--pg-text-primary)">
					{source.jobTitle || 'Job'}
				</h3>
				{job?.createdAt && (
					<p className="text-sm text-(--pg-text-secondary)">
						Created {formatDate(job.createdAt)}
					</p>
				)}
			</div>

			<dl className="grid grid-cols-2 gap-4 text-sm">
				{[
					['Client', client],
					['Provider', provider],
				].map(([role, p]) => (
					<div key={role}>
						<dt className="text-xs text-(--pg-text-secondary)">{role}</dt>
						<dd className="font-semibold text-(--pg-text-primary)">{p.name}</dd>
						{p.email && (
							<dd>
								<a
									href={`mailto:${p.email}`}
									className="break-all text-(--pg-text-highlight) hover:underline"
								>
									{p.email}
								</a>
							</dd>
						)}
					</div>
				))}
			</dl>

			{jobQuery.isPending ? (
				<AppLoader />
			) : blocked ? (
				<p className="inline-flex items-start gap-2 rounded-xl border border-dashed border-(--pg-card-border) p-3 text-sm text-(--pg-text-secondary)">
					<LuLock aria-hidden="true" className="mt-0.5 shrink-0" /> The job’s
					stages, money and contracts are for admins. Its payments are below.
				</p>
			) : job ? (
				<>
					<div>
						<p className={label}>Money</p>
						<dl className="grid grid-cols-3 gap-4 text-sm">
							<Fact
								name="Total"
								value={formatMoney(job.totalAmount, currency)}
							/>
							<Fact
								name="Funded"
								value={formatMoney(job.amountPaid || 0, currency)}
							/>
							<Fact name="Held in escrow" value={formatMoney(held, currency)} />
							<Fact
								name="Released"
								value={formatMoney(job.amountDisbursed || 0, currency)}
							/>
							<Fact
								name="Paid out"
								value={formatMoney(job.amountPaidOut || 0, currency)}
							/>
							<Fact
								name="Refunded"
								value={formatMoney(job.totalRefunded || 0, currency)}
							/>
						</dl>
						<p className="mt-2 text-xs text-(--pg-text-secondary)">
							Platform fee {job.platformFeePercent || 0}% · collected{' '}
							{formatMoney(job.platformFeeCollected || 0, currency)}
						</p>
					</div>

					{job.stages?.length > 0 && (
						<div>
							<p className={label}>Stages</p>
							<ol className="flex flex-col gap-1.5 text-sm">
								{job.stages.map((stage, i) => (
									<li
										key={stage._id}
										className="flex items-center justify-between gap-3"
									>
										<span className="text-(--pg-text-primary)">
											{i + 1}. {stage.payment}% ·{' '}
											{formatMoney(
												(job.totalAmount * stage.payment) / 100,
												currency
											)}
										</span>
										<StatusBadge
											label={
												stage.isVerified
													? 'Released'
													: stage.isDone
														? 'Done — to verify'
														: 'In progress'
											}
											tone={
												stage.isVerified
													? 'success'
													: stage.isDone
														? 'warning'
														: 'neutral'
											}
										/>
									</li>
								))}
							</ol>
						</div>
					)}

					{(job.disputeReason || job.disputeHistory?.length > 0) && (
						<div>
							<p className={label}>Disputes</p>
							{job.disputeReason && (
								<p className="text-sm text-(--pg-text-primary)">
									<strong>Open:</strong> {job.disputeReason}
								</p>
							)}
							<ul className="mt-1 flex flex-col gap-1 text-sm text-(--pg-text-secondary)">
								{job.disputeHistory?.map((d, i) => (
									<li key={i}>
										Resolved {formatDate(d.resolvedAt, true)} — {d.note}
									</li>
								))}
							</ul>
						</div>
					)}

					{(job.refunds?.length > 0 || job.payouts?.length > 0) && (
						<div>
							<p className={label}>Refund & payout requests</p>
							<ul className="flex flex-col gap-2 text-sm">
								{[
									...(job.refunds || []).map((r) => ({
										...r,
										kind: 'Refund',
										text: r.reason,
									})),
									...(job.payouts || []).map((p) => ({
										...p,
										kind: 'Payout',
										text: p.note,
									})),
								]
									.sort(
										(a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
									)
									.map((r) => (
										<li
											key={r._id}
											className="flex items-start justify-between gap-3"
										>
											<span className="text-(--pg-text-primary)">
												{r.kind} · {formatMoney(r.amount || 0, currency)} ·{' '}
												{formatDate(r.requestedAt)}
												{r.text && (
													<span className="block text-(--pg-text-secondary)">
														{r.text}
													</span>
												)}
												{r.declineReason && (
													<span className="block text-(--pg-text-secondary)">
														Declined: {r.declineReason}
													</span>
												)}
											</span>
											<StatusBadge status={r.status} map={REQUEST_BADGES} />
										</li>
									))}
							</ul>
						</div>
					)}

					{(job.client?.contractFile || job.provider?.contractFile) && (
						<div>
							<p className={label}>Contracts</p>
							<ul className="flex flex-col gap-1.5 text-sm">
								{['client', 'provider'].map((role) => {
									const file = job[role]?.contractFile;
									if (!file) return null;
									return (
										<li
											key={role}
											className="flex flex-wrap items-center gap-3"
										>
											<span className="text-(--pg-text-secondary) capitalize">
												{role}:
											</span>
											<span className="min-w-0 truncate text-(--pg-text-primary)">
												{file.fileName}
											</span>
											{file.requestUrl && (
												<a
													href={file.requestUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1 text-(--pg-text-highlight) hover:underline"
												>
													<LuEye aria-hidden="true" /> View
												</a>
											)}
											{file.downloadUrl && (
												<a
													href={file.downloadUrl}
													className="inline-flex items-center gap-1 text-(--pg-text-highlight) hover:underline"
												>
													<LuDownload aria-hidden="true" /> Download
												</a>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</>
			) : null}

			<div>
				<p className={`${label} inline-flex items-center gap-1.5`}>
					<LuReceipt aria-hidden="true" /> Payments
				</p>
				{payments.isPending ? (
					<AppLoader />
				) : !payments.data?.length ? (
					<p className="text-sm text-(--pg-text-secondary)">
						No payments into this job yet.
					</p>
				) : (
					<ul className="flex flex-col divide-y divide-(--pg-card-border) text-sm">
						{payments.data.map((p) => (
							<li
								key={p._id}
								className="flex items-center justify-between gap-3 py-2"
							>
								<span>
									<span className="font-semibold text-(--pg-text-primary)">
										{formatMoney(p.amount, p.currency)}
									</span>
									<span className="block text-xs text-(--pg-text-secondary)">
										{formatDate(p.createdAt, true)} ·{' '}
										{p.provider === 'manual'
											? 'Recorded by an admin'
											: 'Card (Stripe)'}
									</span>
								</span>
								<StatusBadge status={p.status} map={PAYMENT_STATUS_BADGES} />
							</li>
						))}
					</ul>
				)}
				{canManage && job && (
					<form
						onSubmit={onRecord}
						noValidate
						className="mt-4 flex items-end gap-2"
					>
						<div className="flex-1">
							<CustomInput
								label="Record a payment received outside Stripe"
								name="manualAmount"
								type="number"
								inputMode="decimal"
								min="0"
								step="0.01"
								placeholder="Amount in USD"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</div>
						<AppButton
							type="submit"
							variant="secondary"
							disabled={record.isPending}
						>
							Record
						</AppButton>
					</form>
				)}
			</div>
			<ConfirmModal refName={confirmRef} />
		</div>
	);
}

JobReview.propTypes = {
	jobId: PropTypes.string.isRequired,
	fallback: PropTypes.object,
};

export default JobReview;
