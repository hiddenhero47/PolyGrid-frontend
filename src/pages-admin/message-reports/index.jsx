import React, { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuCheck,
	LuCloudOff,
	LuMessageSquareX,
	LuPartyPopper,
	LuRotateCw,
	LuInbox,
} from 'react-icons/lu';
import AdminModerationServices from '../../features/services/custom-hooks/admin-moderation';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import ConfirmModal from '../../components/modal/confirm-modal';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import { MANAGE_ROLES } from '../../utilities/app-const';
import { formatDate } from '../../utilities/basic-functions';

const LIMIT = 10;
const TABS = [
	{ value: 'pending', label: 'Open' },
	{ value: 'resolved', label: 'Resolved' },
];
const REDACTED = '[message removed by moderator]';
const obj = (v) => (v && typeof v === 'object' ? v : null);

// frontend-plan §C.12 — Message reports. Every review role reads them;
// admin / super_admin resolve, optionally removing the message's text in
// the same step (the message itself stays, replaced by "[message removed
// by moderator]"). A resolved report is closed for good. The reporter is
// never told the outcome. URL: ?status=pending|resolved&page=
function MessageReports() {
	const [params, setParams] = useSearchParams();
	const status = params.get('status') === 'resolved' ? 'resolved' : 'pending';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const query = AdminModerationServices.messageReports({
		status,
		page,
		limit: LIMIT,
	});
	const resolve = AdminModerationServices.resolveReport();
	const confirmRef = useRef(null);
	// the backend filters by status; until it does, don't show the other tab's reports here
	const reports = (query.data?.data || []).filter((r) => r.status === status);

	const onResolve = async (report, redactMessage) => {
		const ok = await confirmRef.current.ask(
			redactMessage
				? {
						title: 'Remove the message and resolve?',
						text: `Its text is replaced for both people with “${REDACTED}”. This can’t be undone.`,
						confirmLabel: 'Remove & resolve',
					}
				: {
						title: 'Resolve and keep the message?',
						text: 'The report is closed; the message stays as it is.',
						confirmLabel: 'Resolve',
					}
		);
		if (ok)
			resolve.mutate(
				{ id: report._id, redactMessage },
				{
					onSuccess: () =>
						toast.success(
							redactMessage
								? 'Message removed — report resolved'
								: 'Report resolved'
						),
				}
			);
	};

	return (
		<>
			<PageHeader
				eyebrow="Review queues"
				title="Message reports"
				subtitle="Messages someone flagged in a conversation. Read it, decide, and resolve — removing the text if it breaks the rules. The reporter isn’t told the outcome."
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

			{query.isPending && (
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

			{query.isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load reports"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => query.refetch()}>
							Retry
						</AppButton>
					}
				/>
			)}

			{!query.isPending && !query.isError && reports.length === 0 && (
				<EmptyState
					tone={status === 'pending' ? 'success' : 'neutral'}
					icon={status === 'pending' ? <LuPartyPopper /> : <LuInbox />}
					title={
						status === 'pending' ? 'No open reports' : 'Nothing resolved yet'
					}
				/>
			)}

			{reports.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: query.isFetching && !query.isPending ? 0.6 : 1 }}
				>
					{reports.map((report) => {
						const message = obj(report.messageId);
						const reporter = obj(report.reportedBy);
						const sender = obj(report.messageSender) || obj(message?.sender);
						const resolver = obj(report.resolvedBy);
						const removed = message?.body === REDACTED;
						return (
							<ReviewCard
								key={report._id}
								aria-labelledby={`rep-${report._id}`}
							>
								<div className="sc_who">
									<div className="min-w-0 flex-1">
										<h3 id={`rep-${report._id}`} className="sc_name">
											Reported by {reporter?.fullName || 'a user'}
										</h3>
										<div className="sc_meta">
											{reporter?.email && (
												<a
													href={`mailto:${reporter.email}`}
													className="text-(--pg-text-highlight) hover:underline"
												>
													{reporter.email}
												</a>
											)}
											<span>{formatDate(report.createdAt, true)}</span>
										</div>
									</div>
									<StatusBadge
										label={report.status === 'resolved' ? 'Resolved' : 'Open'}
										tone={report.status === 'resolved' ? 'neutral' : 'warning'}
									/>
								</div>

								<p className="text-[15px] text-(--pg-text-primary)">
									<span className="text-(--pg-text-secondary)">Reason: </span>
									{report.reason}
								</p>

								{Array.isArray(report.context) && report.context.length > 0 ? (
									<ol className="flex flex-col gap-1.5 rounded-xl bg-(--pg-surface-card) p-4 text-sm">
										{report.context.map((m) => (
											<li
												key={m._id}
												className={
													String(m._id) === String(message?._id)
														? 'rounded-lg bg-(--pg-status-warningSoft) px-2 py-1 font-semibold text-(--pg-text-primary)'
														: 'px-2 text-(--pg-text-secondary)'
												}
											>
												<span className="text-xs">
													{formatDate(m.createdAt, true)} ·{' '}
												</span>
												{m.body}
											</li>
										))}
									</ol>
								) : (
									<blockquote className="rounded-xl border-l-4 border-(--pg-status-warning) bg-(--pg-surface-card) p-4">
										<p
											className={`text-[15px] whitespace-pre-line ${removed ? 'text-(--pg-text-secondary) italic' : 'text-(--pg-text-primary)'}`}
										>
											{message
												? message.body
												: 'This message no longer exists.'}
										</p>
										{message && (
											<p className="mt-2 text-xs text-(--pg-text-secondary)">
												{sender?.fullName
													? `${sender.fullName}${sender.email ? ` · ${sender.email}` : ''} · `
													: 'Sent '}
												{formatDate(message.createdAt, true)}
											</p>
										)}
									</blockquote>
								)}

								{report.status === 'resolved' ? (
									<p className="text-sm text-(--pg-text-secondary)">
										Resolved {formatDate(report.resolvedAt, true)}
										{resolver?.fullName ? ` by ${resolver.fullName}` : ''}
										{removed ? ' · message removed' : ' · message kept'}
										{report.resolutionNote ? ` — ${report.resolutionNote}` : ''}
									</p>
								) : (
									canManage && (
										<div className="flex flex-wrap gap-2">
											<AppButton
												variant="secondary"
												icon={<LuCheck />}
												onClick={() => onResolve(report, false)}
												disabled={resolve.isPending}
											>
												Resolve — keep message
											</AppButton>
											<AppButton
												icon={<LuMessageSquareX />}
												onClick={() => onResolve(report, true)}
												disabled={resolve.isPending || removed}
											>
												Remove message & resolve
											</AppButton>
										</div>
									)
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
								...(status === 'resolved' && { status }),
								...(next > 1 && { page: String(next) }),
							})
						}
					/>
				</div>
			)}
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

export default MessageReports;
