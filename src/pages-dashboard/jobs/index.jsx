import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuHandshake,
	LuCloudOff,
	LuRotateCw,
	LuArrowRight,
	LuCircleAlert,
} from 'react-icons/lu';
import JobServices from '../../features/services/custom-hooks/jobs';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import StatusBadge from '../../components/status-badge';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import { JOB_STATUS_BADGES, JOB_TYPE_LABELS } from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import { myRoleIn, otherRole, partyName } from './elements/job-helpers';

const LIMIT = 12;
const TABS = [
	{ value: '', label: 'All' },
	{ value: 'pending_confirmation', label: 'To confirm' },
	{ value: 'active', label: 'Active' },
	{ value: 'disputed', label: 'Disputed' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

// frontend-plan §B.6 — My Jobs: every job I'm the client or provider on,
// newest first, filtered by status. URL: ?status=&page=
function MyJobs() {
	const [params, setParams] = useSearchParams();
	const { user } = useSelector((state) => state.auth);
	const status = params.get('status') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { data, isPending, isError, isFetching, refetch } = JobServices.mine({
		status,
		page,
		limit: LIMIT,
	});
	const jobs = data?.data || [];

	return (
		<>
			<PageHeader
				eyebrow="Activity"
				title="Jobs"
				subtitle="Work agreed through PolyGrid — direct hires, tender awards and SiteForce bookings. Money is held per job and released stage by stage."
			/>

			<div className="mb-6 overflow-x-auto">
				<SegmentedControl
					label="Status"
					options={TABS}
					value={status}
					onChange={(value) => setParams(value ? { status: value } : {})}
				/>
			</div>

			{isPending ? (
				<div className="flex flex-col gap-3">
					{Array.from({ length: 4 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 88, borderRadius: 16 }}
						/>
					))}
				</div>
			) : isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load your jobs"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
				/>
			) : jobs.length === 0 ? (
				<EmptyState
					tone="accent"
					icon={<LuHandshake />}
					title={status ? 'Nothing here' : 'No jobs yet'}
					text="Hire someone from their profile with “Request a job”, or win one through a tender or SiteForce."
					actions={
						!status && (
							<AppButton to={ROUTES.ENGINEERING} icon={<LuArrowRight />}>
								Find someone to hire
							</AppButton>
						)
					}
				/>
			) : (
				<ul
					className="flex flex-col gap-3 transition-opacity"
					style={{ opacity: isFetching ? 0.6 : 1 }}
				>
					{jobs.map((job) => {
						const role = myRoleIn(job, user?.id);
						const needsMe =
							job.status === 'pending_confirmation' &&
							role &&
							!job[role]?.isConfirmed;
						return (
							<li key={job.id}>
								<Link
									to={`${ROUTES.DASHBOARD_JOBS}/${job.id}`}
									className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4 transition-colors hover:border-(--pg-card-borderHover) md:flex-nowrap"
								>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="truncate text-[15.5px] font-semibold text-(--pg-text-primary)">
												{job.jobTitle}
											</span>
											<Chip>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</Chip>
										</div>
										<p className="mt-1 text-sm text-(--pg-text-secondary)">
											{role === 'client' ? 'You’re hiring' : 'You’re providing'}{' '}
											· with {partyName(job, otherRole(role), role)} ·{' '}
											{formatDate(job.createdAt)}
										</p>
										{job.stages?.total > 0 && (
											<p className="mt-1 text-xs text-(--pg-text-secondary)">
												{job.stages.verified} / {job.stages.total} stages paid
												{job.amountPaid != null &&
													` · ${formatMoney(job.amountPaid, job.currency)} funded`}
											</p>
										)}
										{needsMe && (
											<p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-(--pg-status-warning)">
												<LuCircleAlert aria-hidden="true" /> Waiting for you to
												confirm
											</p>
										)}
									</div>
									<span className="font-display text-xl font-semibold text-(--pg-text-primary)">
										{formatMoney(job.totalAmount, job.currency)}
									</span>
									<StatusBadge status={job.status} map={JOB_STATUS_BADGES} />
								</Link>
							</li>
						);
					})}
				</ul>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={data.pagination}
						changePage={(next) =>
							setParams({
								...(status && { status }),
								...(next > 1 && { page: String(next) }),
							})
						}
					/>
				</div>
			)}
		</>
	);
}

export default MyJobs;
