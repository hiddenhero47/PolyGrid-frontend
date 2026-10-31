import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuCheck,
	LuCloudOff,
	LuEye,
	LuPartyPopper,
	LuRotateCw,
} from 'react-icons/lu';
import AdminMoneyServices from '../../features/services/custom-hooks/admin-money';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import Modal from '../../components/modal/index_modal';
import ReasonModal from '../../components/modal/reason-modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import JobReview from '../elements/job-review';
import { JOB_TYPE_LABELS, MANAGE_ROLES } from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';

const LIMIT = 10;

const idOf = (v) => String(v?._id || v?.id || v || '');
const who = (u) => (typeof u === 'object' && u ? u : null);

// frontend-plan §C.7 — Disputes: jobs where one side raised a dispute.
// Every review role sees the queue; admin / super_admin resolve it with
// a note (appended to the job's history; the job goes back to active and
// both sides are notified). URL: ?page=
function Disputes() {
	const [params, setParams] = useSearchParams();
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const { data, isPending, isError, isFetching, refetch } =
		AdminMoneyServices.disputes({ page, limit: LIMIT });
	const resolve = AdminMoneyServices.resolveDispute();
	const reasonRef = useRef(null);
	const drawerRef = useRef(null);
	const [viewing, setViewing] = useState(null);
	const jobs = data?.data || [];

	const onResolve = async (job) => {
		const note = await reasonRef.current.ask({
			eyebrow: 'Resolve dispute',
			title: job.jobTitle,
			text: 'Say what was decided and why. Both sides are notified, the note is kept on the job, and the job goes back to active — approve a refund or payout separately if money should move.',
			label: 'Resolution note',
			required: true,
			confirmLabel: 'Resolve',
		});
		if (note)
			resolve.mutate(
				{ id: idOf(job), note },
				{ onSuccess: () => toast.success('Dispute resolved') }
			);
	};

	const view = (job) => {
		setViewing(job);
		drawerRef.current.open();
	};

	return (
		<>
			<PageHeader
				eyebrow="Review queue"
				title="Disputes"
				subtitle="Jobs where the client or provider says something went wrong. Work and payouts on them are paused until you resolve them."
			/>

			{isPending && (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 140, borderRadius: 18 }}
						/>
					))}
				</div>
			)}

			{isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load disputes"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
				/>
			)}

			{!isPending && !isError && jobs.length === 0 && (
				<EmptyState
					tone="success"
					icon={<LuPartyPopper />}
					title="No open disputes"
					text="Nothing needs a decision."
				/>
			)}

			{jobs.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: isFetching && !isPending ? 0.6 : 1 }}
				>
					{jobs.map((job) => {
						const client = who(job.client?.userId);
						const provider = who(job.provider?.userId);
						const by = who(job.disputedBy);
						const byRole =
							by && idOf(by) === idOf(client)
								? 'client'
								: by && idOf(by) === idOf(provider)
									? 'provider'
									: null;
						return (
							<ReviewCard
								key={idOf(job)}
								aria-labelledby={`dispute-${idOf(job)}`}
							>
								<div className="sc_who">
									<div className="min-w-0 flex-1">
										<h3 id={`dispute-${idOf(job)}`} className="sc_name">
											{job.jobTitle}
										</h3>
										<div className="sc_meta">
											<span>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
											<span>
												{formatMoney(job.totalAmount, job.currency)} · funded{' '}
												{formatMoney(job.amountPaid || 0, job.currency)}
											</span>
											<span>Updated {formatDate(job.updatedAt, true)}</span>
										</div>
									</div>
									<StatusBadge label="Disputed" tone="error" />
								</div>

								<dl className="grid gap-3 text-sm sm:grid-cols-2">
									{[
										['Client', client],
										['Provider', provider],
									].map(([role, p]) => (
										<div key={role}>
											<dt className="text-xs text-(--pg-text-secondary)">
												{role}
											</dt>
											<dd className="font-semibold text-(--pg-text-primary)">
												{p?.fullName || '—'}
											</dd>
											{p?.email && (
												<dd>
													<a
														href={`mailto:${p.email}`}
														className="text-(--pg-text-highlight) hover:underline"
													>
														{p.email}
													</a>
												</dd>
											)}
										</div>
									))}
								</dl>

								<div className="rounded-xl bg-(--pg-surface-card) p-4">
									<p className="text-xs text-(--pg-text-secondary)">
										Raised by {by?.fullName || 'a party'}
										{byRole && ` (the ${byRole})`}
									</p>
									<p className="mt-1 text-[15px] whitespace-pre-line text-(--pg-text-primary)">
										{job.disputeReason || 'No reason given.'}
									</p>
								</div>

								{job.disputeHistory?.length > 0 && (
									<p className="text-sm text-(--pg-text-secondary)">
										Disputed before — {job.disputeHistory.length} earlier
										resolution
										{job.disputeHistory.length === 1 ? '' : 's'}.
									</p>
								)}

								<div className="flex flex-wrap gap-2">
									<AppButton
										variant="secondary"
										icon={<LuEye />}
										onClick={() => view(job)}
									>
										Open job
									</AppButton>
									{canManage && (
										<AppButton
											icon={<LuCheck />}
											onClick={() => onResolve(job)}
											disabled={resolve.isPending}
										>
											Resolve
										</AppButton>
									)}
								</div>
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
							setParams(next > 1 ? { page: String(next) } : {})
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
					{viewing && <JobReview jobId={idOf(viewing)} fallback={viewing} />}
				</Modal.Card>
			</Modal.Right>
			<ReasonModal refName={reasonRef} />
		</>
	);
}

export default Disputes;
