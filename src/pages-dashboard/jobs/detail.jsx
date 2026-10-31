import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import {
	LuCheck,
	LuCircleAlert,
	LuCircleCheck,
	LuCloudOff,
	LuDownload,
	LuEye,
	LuFileText,
	LuHandshake,
	LuListChecks,
	LuPencil,
	LuRotateCw,
	LuTriangleAlert,
	LuUpload,
	LuWallet,
	LuX,
	LuMessageSquare,
} from 'react-icons/lu';
import JobServices, { jobKey } from '../../features/services/custom-hooks/jobs';
import PaymentServices from '../../features/services/custom-hooks/payments';
import MessageServices from '../../features/services/custom-hooks/messages';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import AppLoader from '../../components/loader';
import EmptyState from '../../components/empty-state';
import StatusBadge from '../../components/status-badge';
import ProfileAvatar from '../../components/profile-avatar';
import ConfirmModal from '../../components/modal/confirm-modal';
import CheckoutModal from '../../components/checkout-modal';
import { AppButton } from '../../components/button';
import { Chip } from '../../pages/home/elements/index.style';
import { JOB_STATUS_BADGES, JOB_TYPE_LABELS } from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import {
	myRoleIn,
	otherRole,
	partyName,
	partyUser,
	stageAmount,
} from './elements/job-helpers';
import ReasonModal from '../../components/modal/reason-modal';
import StagesModal from './elements/stages-modal';
import FundModal from './elements/fund-modal';
import EditJobModal from './elements/edit-modal';
import { BackLink, Panel, eyebrowClass } from '../elements/panels';

const REQUEST_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	approved: { label: 'Approved', tone: 'success' },
	declined: { label: 'Declined', tone: 'error' },
};
const CONTRACT_ACCEPT = '.pdf,.docx';

function Money({ label, value, currency, strong }) {
	return (
		<div>
			<dt className="text-xs text-(--pg-text-secondary)">{label}</dt>
			<dd
				className={`mt-1 font-display font-semibold text-(--pg-text-primary) ${strong ? 'text-2xl' : 'text-lg'}`}
			>
				{formatMoney(value || 0, currency)}
			</dd>
		</div>
	);
}

// frontend-plan §B.6 — one job: who's involved, its money (escrow →
// released stage by stage → paid out), its stages, contracts, and the
// actions open to *you* right now. Every action is the backend's to
// allow; the page only offers what the job's state says is possible.
function JobDetail() {
	const { id } = useParams();
	const { user } = useSelector((state) => state.auth);
	const queryClient = useQueryClient();
	const { data: job, isPending, isError, error, refetch } = JobServices.get(id);

	const confirm = JobServices.confirm();
	const cancel = JobServices.cancel();
	const update = JobServices.update();
	const propose = JobServices.proposeStages();
	const accept = JobServices.acceptStages();
	const reject = JobServices.rejectStages();
	const stageDone = JobServices.stageDone();
	const stageVerify = JobServices.stageVerify();
	const uploadContract = JobServices.uploadContract();
	const dispute = JobServices.dispute();
	const requestRefund = JobServices.requestRefund();
	const requestPayout = JobServices.requestPayout();
	const fundJob = PaymentServices.fundJob();
	const refreshPayment = PaymentServices.refresh();
	const startChat = MessageServices.start();
	const navigate = useNavigate();

	const confirmRef = useRef(null);
	const reasonRef = useRef(null);
	const stagesRef = useRef(null);
	const fundRef = useRef(null);
	const editRef = useRef(null);
	const checkoutRef = useRef(null);
	const fileRef = useRef(null);
	const [checkout, setCheckout] = useState(null); // { amount, clientSecret, paymentId }

	const back = <BackLink to={ROUTES.DASHBOARD_JOBS}>All jobs</BackLink>;

	if (isPending) return <AppLoader fullPage showLabel label="Loading job" />;
	if (isError || !job) {
		const status = error?.response?.status;
		return (
			<>
				{back}
				{status === 404 || status === 403 || status === 400 ? (
					<EmptyState
						icon={<LuHandshake />}
						title="Job not found"
						text="It may have been removed, or it isn’t one you’re part of."
						actions={
							<AppButton to={ROUTES.DASHBOARD_JOBS}>
								Back to your jobs
							</AppButton>
						}
					/>
				) : (
					<EmptyState
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load this job"
						actions={
							<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
								Retry
							</AppButton>
						}
					/>
				)}
			</>
		);
	}

	const me = myRoleIn(job, user?.id);
	const them = otherRole(me);
	const themName = partyName(job, them, me);
	const isCreator = String(job.createdBy) === String(user?.id);
	const pending = job.status === 'pending_confirmation';
	const active = job.status === 'active';
	const disputed = job.status === 'disputed';
	const currency = job.currency;
	const unfunded = Math.max((job.totalAmount || 0) - (job.amountPaid || 0), 0);
	const proposal = job.proposedStages?.stages?.length
		? job.proposedStages
		: null;
	const proposedByMe =
		proposal && String(proposal.proposedBy) === String(user?.id);
	const pendingRefund = job.refunds?.some((r) => r.status === 'pending');
	const pendingPayout = job.payouts?.some((p) => p.status === 'pending');
	const heldInEscrow = Math.max(
		(job.amountPaid || 0) -
			(job.amountDisbursed || 0) -
			(job.platformFeeCollected || 0) -
			(job.totalRefunded || 0),
		0
	);
	const availableToPayOut = Math.max(
		Math.min(job.amountDisbursed || 0, job.amountPaid || 0) -
			(job.amountPaidOut || 0),
		0
	);
	const finished = ['completed', 'cancelled', 'closed'].includes(job.status);

	const ask = (opts) => confirmRef.current.ask(opts);
	const run = (mutation, vars, message) =>
		mutation.mutate(vars, {
			onSuccess: () => message && toast.success(message),
		});

	const onConfirm = async () => {
		const ok = await ask({
			title: 'Confirm this job?',
			text: `You agree to the title, total (${formatMoney(job.totalAmount, currency)}) and stages as they stand. Once both sides confirm, the job is active.`,
			confirmLabel: 'Confirm job',
		});
		if (ok) run(confirm, job._id, 'Confirmed');
	};

	const onCancel = async () => {
		const ok = await ask({
			title: 'Cancel this job?',
			text: `${themName} will be told. This can’t be undone — you’d create a new job instead.`,
			confirmLabel: 'Cancel job',
		});
		if (ok) run(cancel, job._id, 'Job cancelled');
	};

	const onDispute = async () => {
		const reason = await reasonRef.current.ask({
			eyebrow: 'Dispute',
			title: 'Raise a dispute',
			text: 'Work and payouts on this job pause until PolyGrid’s team resolves it. Say what went wrong.',
			label: 'What’s the problem?',
			required: true,
			confirmLabel: 'Raise dispute',
		});
		if (reason)
			run(
				dispute,
				{ id: job._id, reason },
				'Dispute raised — our team will be in touch'
			);
	};

	const onRefund = async () => {
		const reason = await reasonRef.current.ask({
			eyebrow: 'Refund',
			title: 'Request a refund',
			text: `Asks PolyGrid to return what’s still held in escrow (${formatMoney(heldInEscrow, currency)}). Money already released for verified stages isn’t refundable.`,
			label: 'Why?',
			required: true,
			confirmLabel: 'Request refund',
		});
		if (reason) run(requestRefund, { id: job._id, reason }, 'Refund requested');
	};

	const onPayout = async () => {
		const note = await reasonRef.current.ask({
			eyebrow: 'Payout',
			title: 'Request a payout',
			text: `Asks PolyGrid to send what’s been released to you (${formatMoney(availableToPayOut, currency)}) to your payout account.`,
			label: 'Note (optional)',
			confirmLabel: 'Request payout',
		});
		if (note !== null)
			run(requestPayout, { id: job._id, note }, 'Payout requested');
	};

	const onVerify = async (stage, index) => {
		const ok = await ask({
			title: `Verify stage ${index + 1}?`,
			text: `This releases ${formatMoney(stageAmount(job, stage), currency)} to ${themName}${job.platformFeePercent ? `, less PolyGrid’s ${job.platformFeePercent}% fee` : ''}. It can’t be undone.`,
			confirmLabel: 'Verify & release',
		});
		if (ok)
			run(
				stageVerify,
				{ id: job._id, stageId: stage._id },
				'Stage verified — payment released'
			);
	};

	const onReject = async () => {
		const ok = await ask({
			title: 'Reject the proposed stages?',
			text: 'The current stages stay as they are.',
			confirmLabel: 'Reject',
		});
		if (ok) run(reject, job._id, 'Proposal rejected');
	};

	const onContract = (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		if (!/\.(pdf|docx)$/i.test(file.name)) {
			toast.error('Upload a PDF or Word (.docx) file');
			return;
		}
		run(uploadContract, { id: job._id, file }, 'Contract uploaded');
	};

	const startFunding = (amount) =>
		fundJob.mutate(
			{ jobId: job._id, amount },
			{
				onSuccess: (res) => {
					fundRef.current.close();
					setCheckout({
						amount,
						clientSecret: res.clientSecret,
						paymentId: res.paymentId,
					});
					checkoutRef.current.open();
				},
			}
		);

	// Stripe accepted the card — ask the backend to check with Stripe now
	// rather than wait for the webhook, then reload the job.
	const paid = () => {
		const { paymentId, amount } = checkout;
		checkoutRef.current.close();
		toast.success(`${formatMoney(amount, currency)} paid into escrow`);
		refreshPayment.mutate(paymentId, {
			onSettled: () =>
				queryClient.invalidateQueries({ queryKey: jobKey(job._id) }),
		});
	};

	// What needs *you* right now — one line above everything else.
	let needs = null;
	if (pending && !job[me]?.isConfirmed)
		needs = `${themName} set this job up — check the terms and confirm it to get started.`;
	else if (pending) needs = `Waiting for ${themName} to confirm.`;
	else if (disputed)
		needs = 'This job is in dispute. PolyGrid’s team is reviewing it.';
	else if (active && proposal && !proposedByMe)
		needs = `${themName} proposed new stages — accept or reject them below.`;
	else if (active && me === 'client' && unfunded > 0 && job.amountPaid === 0)
		needs = 'Fund the job so the provider knows the money is there.';
	else if (
		active &&
		me === 'client' &&
		job.stages?.some((s) => s.isDone && !s.isVerified)
	)
		needs =
			'A stage is marked done — check the work and verify it to release payment.';

	return (
		<>
			{back}
			<PageHeader
				eyebrow={JOB_TYPE_LABELS[job.jobType] || 'Job'}
				title={job.jobTitle}
				subtitle={`${me === 'client' ? 'You’re hiring' : 'You’re providing the work'} · with ${themName} · created ${formatDate(job.createdAt)}`}
			/>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<StatusBadge status={job.status} map={JOB_STATUS_BADGES} />
				{pending && !job[me]?.isConfirmed && (
					<AppButton
						icon={<LuCheck />}
						onClick={onConfirm}
						disabled={confirm.isPending}
					>
						{confirm.isPending ? 'Confirming…' : 'Confirm job'}
					</AppButton>
				)}
				{pending && isCreator && (
					<>
						<AppButton
							variant="secondary"
							icon={<LuPencil />}
							onClick={() => editRef.current.open()}
						>
							Edit
						</AppButton>
						<AppButton
							variant="secondary"
							icon={<LuX />}
							onClick={onCancel}
							disabled={cancel.isPending}
						>
							Cancel job
						</AppButton>
					</>
				)}
				{active && me === 'client' && unfunded > 0 && (
					<AppButton icon={<LuWallet />} onClick={() => fundRef.current.open()}>
						Fund {formatMoney(unfunded, currency)}
					</AppButton>
				)}
				{!finished && !disputed && !pending && (
					<AppButton
						variant="secondary"
						icon={<LuTriangleAlert />}
						onClick={onDispute}
					>
						Raise a dispute
					</AppButton>
				)}
				{job[them]?.userId && (
					<AppButton
						variant="secondary"
						icon={<LuMessageSquare />}
						onClick={() =>
							startChat.mutate(
								String(job[them].userId._id || job[them].userId),
								{
									onSuccess: (conversation) =>
										navigate(`${ROUTES.DASHBOARD_MESSAGES}/${conversation.id}`),
								}
							)
						}
						disabled={startChat.isPending}
					>
						Message
					</AppButton>
				)}
			</div>

			{needs && (
				<p className="mb-6 flex items-start gap-2 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-card) p-4 text-sm text-(--pg-text-primary)">
					<LuCircleAlert
						aria-hidden="true"
						className="mt-0.5 shrink-0 text-(--pg-status-warning)"
					/>
					{needs}
				</p>
			)}

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="flex min-w-0 flex-col gap-5">
					<Panel title="The work" icon={<LuFileText aria-hidden="true" />}>
						<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
							{job.jobDescription}
						</p>
					</Panel>

					<Panel
						title="Stages"
						icon={<LuListChecks aria-hidden="true" />}
						action={
							active &&
							!proposal && (
								<AppButton
									variant="secondary"
									onClick={() => stagesRef.current.open()}
								>
									Propose changes
								</AppButton>
							)
						}
					>
						{job.stages?.length ? (
							<ol className="flex flex-col gap-3">
								{job.stages.map((stage, i) => (
									<li
										key={stage._id}
										className="flex flex-wrap items-start gap-3 rounded-xl border border-(--pg-card-border) p-4"
									>
										<span className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-(--pg-surface-card) text-sm font-semibold text-(--pg-text-primary)">
											{i + 1}
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-(--pg-text-primary)">
												{stage.payment}% ·{' '}
												{formatMoney(stageAmount(job, stage), currency)}
											</p>
											{stage.details?.length > 0 && (
												<ul className="mt-1.5 flex flex-wrap gap-1.5">
													{stage.details.map((d) => (
														<Chip key={d}>{d}</Chip>
													))}
												</ul>
											)}
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<StatusBadge
												label={
													stage.isVerified
														? 'Paid'
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
											{active && me === 'provider' && !stage.isDone && (
												<AppButton
													variant="secondary"
													onClick={() =>
														run(
															stageDone,
															{ id: job._id, stageId: stage._id },
															'Marked done'
														)
													}
													disabled={stageDone.isPending}
												>
													Mark done
												</AppButton>
											)}
											{active &&
												me === 'client' &&
												stage.isDone &&
												!stage.isVerified &&
												// the backend only releases a stage escrow fully covers
												(heldInEscrow + 0.005 >= stageAmount(job, stage) ? (
													<AppButton
														onClick={() => onVerify(stage, i)}
														disabled={stageVerify.isPending}
													>
														Verify & release
													</AppButton>
												) : (
													<AppButton
														icon={<LuWallet />}
														onClick={() => fundRef.current.open()}
														disabled={unfunded <= 0}
													>
														Fund this stage to release it
													</AppButton>
												))}
										</div>
									</li>
								))}
							</ol>
						) : (
							<p className="text-sm text-(--pg-text-secondary)">
								No stages — the full amount is released in one go once the work
								is verified.
							</p>
						)}

						{proposal && (
							<div className="mt-5 rounded-xl border border-dashed border-(--pg-card-borderHover) p-4">
								<p className={eyebrowClass}>
									{proposedByMe
										? 'Your proposal — waiting for them'
										: `Proposed by ${themName}`}
								</p>
								<ol className="mt-3 flex flex-col gap-2 text-sm text-(--pg-text-primary)">
									{proposal.stages.map((stage, i) => (
										<li key={stage._id || i}>
											<strong>Stage {i + 1}</strong> · {stage.payment}% ·{' '}
											{formatMoney(stageAmount(job, stage), currency)}
											{stage.details?.length > 0 && (
												<span className="text-(--pg-text-secondary)">
													{' '}
													— {stage.details.join(', ')}
												</span>
											)}
										</li>
									))}
								</ol>
								{!proposedByMe && active && (
									<div className="mt-4 flex flex-wrap gap-2">
										<AppButton
											icon={<LuCheck />}
											onClick={() =>
												run(accept, job._id, 'New stages accepted')
											}
											disabled={accept.isPending}
										>
											Accept
										</AppButton>
										<AppButton
											variant="secondary"
											onClick={onReject}
											disabled={reject.isPending}
										>
											Reject
										</AppButton>
									</div>
								)}
							</div>
						)}
					</Panel>

					{(job.disputeReason || job.disputeHistory?.length > 0) && (
						<Panel
							title="Disputes"
							icon={<LuTriangleAlert aria-hidden="true" />}
						>
							{disputed && job.disputeReason && (
								<p className="text-sm text-(--pg-text-primary)">
									<strong>
										{String(job.disputedBy) === String(user?.id)
											? 'You'
											: themName}{' '}
										raised:
									</strong>{' '}
									{job.disputeReason}
								</p>
							)}
							{job.disputeHistory?.length > 0 && (
								<ul className="mt-3 flex flex-col gap-2 text-sm text-(--pg-text-secondary)">
									{job.disputeHistory.map((d, i) => (
										<li key={i}>
											Resolved {formatDate(d.resolvedAt)} — {d.note}
										</li>
									))}
								</ul>
							)}
						</Panel>
					)}

					{(job.refunds?.length > 0 || job.payouts?.length > 0) && (
						<Panel
							title="Refund & payout requests"
							icon={<LuWallet aria-hidden="true" />}
						>
							<ul className="flex flex-col divide-y divide-(--pg-card-border)">
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
											className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
										>
											<div className="min-w-0 flex-1 text-sm">
												<p className="font-semibold text-(--pg-text-primary)">
													{r.kind} · {formatMoney(r.amount, currency)}
												</p>
												<p className="text-(--pg-text-secondary)">
													{formatDate(r.requestedAt)}
													{r.text ? ` — ${r.text}` : ''}
													{r.declineReason
														? ` · Declined: ${r.declineReason}`
														: ''}
												</p>
											</div>
											<StatusBadge status={r.status} map={REQUEST_BADGES} />
										</li>
									))}
							</ul>
						</Panel>
					)}
				</div>

				<aside className="flex flex-col gap-5">
					<Panel title="Money" icon={<LuWallet aria-hidden="true" />}>
						<dl className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Money
									label="Total"
									value={job.totalAmount}
									currency={currency}
									strong
								/>
							</div>
							<Money
								label="Funded"
								value={job.amountPaid}
								currency={currency}
							/>
							<Money
								label="Held in escrow"
								value={heldInEscrow}
								currency={currency}
							/>
							<Money
								label="Released"
								value={job.amountDisbursed}
								currency={currency}
							/>
							<Money
								label="Paid out"
								value={job.amountPaidOut}
								currency={currency}
							/>
							{job.totalRefunded > 0 && (
								<Money
									label="Refunded"
									value={job.totalRefunded}
									currency={currency}
								/>
							)}
						</dl>
						{job.platformFeePercent > 0 && (
							<p className="mt-4 text-xs text-(--pg-text-secondary)">
								PolyGrid keeps {job.platformFeePercent}% of each stage as it’s
								released.
							</p>
						)}
						<div className="mt-4 flex flex-col gap-2">
							{me === 'client' &&
								heldInEscrow > 0 &&
								!pendingRefund &&
								['active', 'disputed'].includes(job.status) && (
									<AppButton
										variant="secondary"
										onClick={onRefund}
										disabled={requestRefund.isPending}
									>
										Request a refund
									</AppButton>
								)}
							{me === 'provider' && availableToPayOut > 0 && !pendingPayout && (
								<AppButton
									variant="secondary"
									onClick={onPayout}
									disabled={requestPayout.isPending}
								>
									Request payout · {formatMoney(availableToPayOut, currency)}
								</AppButton>
							)}
							{me === 'provider' && availableToPayOut > 0 && !pendingPayout && (
								<p className="text-xs text-(--pg-text-secondary)">
									Paid to the payout account in{' '}
									<Link to={ROUTES.DASHBOARD_SETTINGS} className="underline">
										Settings
									</Link>
									.
								</p>
							)}
						</div>
					</Panel>

					<Panel
						title="People & contracts"
						icon={<LuHandshake aria-hidden="true" />}
					>
						<ul className="flex flex-col gap-4">
							{['client', 'provider'].map((role) => {
								const party = job[role] || {};
								const file = party.contractFile;
								const person = role === me ? user : partyUser(job, role);
								return (
									<li key={role} className="flex flex-col gap-2">
										<div className="flex items-center gap-3">
											<ProfileAvatar
												name={person?.fullName || partyName(job, role, me)}
												avatar={person?.avatar}
												size={40}
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold text-(--pg-text-primary)">
													{role === me
														? 'You'
														: person?.fullName || partyName(job, role, me)}
												</p>
												<p className="text-xs text-(--pg-text-secondary) capitalize">
													{role}
												</p>
											</div>
											{party.isConfirmed ? (
												<LuCircleCheck
													aria-label="Confirmed"
													className="text-(--pg-status-success)"
												/>
											) : (
												<span className="text-xs text-(--pg-text-secondary)">
													Not confirmed
												</span>
											)}
										</div>
										{file ? (
											<div className="flex flex-wrap items-center gap-2 pl-13 text-sm">
												<span className="min-w-0 truncate text-(--pg-text-secondary)">
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
											</div>
										) : (
											<p className="pl-13 text-xs text-(--pg-text-secondary)">
												No contract uploaded
											</p>
										)}
									</li>
								);
							})}
						</ul>
						{!finished && (
							<div className="mt-5">
								<input
									ref={fileRef}
									type="file"
									accept={CONTRACT_ACCEPT}
									className="hidden"
									onChange={onContract}
								/>
								<AppButton
									variant="secondary"
									icon={<LuUpload />}
									onClick={() => fileRef.current.click()}
									disabled={uploadContract.isPending}
								>
									{uploadContract.isPending
										? 'Uploading…'
										: job[me]?.contractFile
											? 'Replace your contract'
											: 'Upload your contract'}
								</AppButton>
								<p className="mt-2 text-xs text-(--pg-text-secondary)">
									Your signed copy, PDF or Word (.docx). Only the two of you and
									PolyGrid’s team can open it.
								</p>
							</div>
						)}
					</Panel>
				</aside>
			</div>

			<ConfirmModal refName={confirmRef} />
			<ReasonModal refName={reasonRef} />
			<StagesModal
				refName={stagesRef}
				job={job}
				isPending={propose.isPending}
				onSubmit={(stages) =>
					propose.mutate(
						{ id: job._id, stages },
						{
							onSuccess: () => {
								stagesRef.current.close();
								toast.success(`Sent — ${themName} needs to accept it`);
							},
						}
					)
				}
			/>
			<FundModal
				refName={fundRef}
				remaining={unfunded}
				currency={currency}
				isPending={fundJob.isPending}
				onContinue={startFunding}
			/>
			<EditJobModal
				refName={editRef}
				job={job}
				isPending={update.isPending}
				onSubmit={(values) =>
					update.mutate(
						{ id: job._id, ...values },
						{
							onSuccess: () => {
								editRef.current.close();
								toast.success('Job updated');
							},
						}
					)
				}
			/>
			<CheckoutModal
				refName={checkoutRef}
				summary={
					checkout && {
						eyebrow: 'Escrow',
						title: `Fund “${job.jobTitle}”`,
						subtitle: `Held by PolyGrid and released to ${themName} as you verify each stage.`,
						amount: checkout.amount,
						currency,
					}
				}
				clientSecret={checkout?.clientSecret}
				onPaid={paid}
			/>
		</>
	);
}

export default JobDetail;
