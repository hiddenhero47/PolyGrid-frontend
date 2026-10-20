import React from 'react';
import { useSelector } from 'react-redux';
import {
	LuBadgeCheck,
	LuUsers,
	LuUserX,
	LuCreditCard,
	LuBriefcase,
	LuDownload,
	LuPackage,
	LuArrowRight,
	LuRotateCw,
	LuCloudOff,
} from 'react-icons/lu';
import AdminServices from '../../../features/services/custom-hooks/admin';
import AdminPageHeader from '../../../layouts/admin-layout/sub-components/page-header';
import EmptyState from '../../../components/empty-state';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import {
	MANAGE_ROLES,
	PROFILE_TYPE_LABELS,
	VERIFICATION_STATUS,
} from '../../../utilities/app-const';
import { ROUTES } from '../../../utilities/app-routes';
import { formatMoney } from '../../../utilities/basic-functions';
import { StatTile, StatTileLink, AdminSection } from '../elements/index.style';

const greeting = () => {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
};

const num = (value) => (value ?? 0).toLocaleString();

// frontend-plan §C.1 — Admin Home: what needs attention first, then the
// platform's numbers (GET /api/stats/overview).
function AdminHome() {
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const overview = AdminServices.getOverview();
	const pending = AdminServices.getVerifications({
		status: VERIFICATION_STATUS.PENDING,
		page: 1,
		limit: 1,
	});
	const stats = overview.data;
	const pendingCount = pending.data?.pagination?.total ?? 0;

	const metrics = [
		{
			label: 'Users',
			value: stats?.totalUsers,
			icon: LuUsers,
		},
		{
			label: 'Suspended',
			value: stats?.suspendedUsers,
			icon: LuUserX,
		},
		{
			label: 'Active subscriptions',
			value: stats?.activeSubscriptions,
			icon: LuCreditCard,
		},
		{
			label: 'Completed jobs',
			value: stats?.completedJobs,
			icon: LuBriefcase,
			// [{ currency, total }] — one entry per currency jobs were paid in
			note: stats?.completedJobsGrossAmount?.length
				? `${stats.completedJobsGrossAmount
						.map(({ currency, total }) => formatMoney(total, currency))
						.join(' + ')} gross`
				: null,
		},
		{
			label: 'Digital purchases',
			value: stats?.successfulDigitalPurchases,
			icon: LuDownload,
		},
		{
			label: 'Store orders',
			value: stats?.storeOrders,
			icon: LuPackage,
		},
	];

	return (
		<>
			<AdminPageHeader
				eyebrow="Overview"
				title={`${greeting()}, ${user?.fullName?.split(' ')[0] || 'admin'}`}
				subtitle="Queues that need a decision come first, then the platform at a glance."
				actions={
					<AppButton
						variant="secondary"
						size="sm"
						icon={<LuRotateCw />}
						onClick={() => {
							overview.refetch();
							pending.refetch();
						}}
					>
						Refresh
					</AppButton>
				}
			/>

			<AdminSection aria-labelledby="attention-heading">
				<div className="sc_sectionHead">
					<h3 id="attention-heading" className="sc_sectionTitle">
						Needs attention
					</h3>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<StatTileLink
						to={ROUTES.ADMIN_VERIFICATIONS}
						$attention={pendingCount > 0}
					>
						<span className="sc_top">
							<span className="sc_label">Pending verifications</span>
							<span className="sc_icon" aria-hidden="true">
								<LuBadgeCheck />
							</span>
						</span>
						<span className="sc_value">
							{pending.isPending ? '—' : num(pendingCount)}
						</span>
						<span className="sc_note inline-flex items-center gap-1.5">
							{pendingCount > 0 ? 'Waiting for a decision' : 'Queue is clear'}
							<LuArrowRight aria-hidden="true" />
						</span>
					</StatTileLink>
				</div>
			</AdminSection>

			<AdminSection aria-labelledby="platform-heading">
				<div className="sc_sectionHead">
					<h3 id="platform-heading" className="sc_sectionTitle">
						Platform
					</h3>
				</div>

				{overview.isError ? (
					<EmptyState
						compact
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load the numbers"
						actions={
							<AppButton
								icon={<LuRotateCw />}
								onClick={() => overview.refetch()}
							>
								Retry
							</AppButton>
						}
					/>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{metrics.map(({ icon: Icon, ...metric }) => (
							<StatTile key={metric.label}>
								<span className="sc_top">
									<span className="sc_label">{metric.label}</span>
									<span className="sc_icon" aria-hidden="true">
										<Icon />
									</span>
								</span>
								{overview.isPending ? (
									<SkeletonBar $width="40%" style={{ height: 34 }} />
								) : (
									<span className="sc_value">{num(metric.value)}</span>
								)}
								{metric.note && <span className="sc_note">{metric.note}</span>}
							</StatTile>
						))}
					</div>
				)}
			</AdminSection>

			{stats?.profileCounts?.length > 0 && (
				<AdminSection aria-labelledby="profiles-heading">
					<div className="sc_sectionHead">
						<h3 id="profiles-heading" className="sc_sectionTitle">
							Business profiles
						</h3>
					</div>
					<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{stats.profileCounts.map(({ profileType, total, verified }) => {
							const share = total ? Math.round((verified / total) * 100) : 0;
							return (
								<li
									key={profileType}
									className="rounded-2xl border border-(--pg-card-border) p-4"
								>
									<div className="flex items-baseline justify-between gap-3">
										<span className="font-semibold text-(--pg-text-primary)">
											{PROFILE_TYPE_LABELS[profileType] || profileType}
										</span>
										<span className="text-sm text-(--pg-text-secondary)">
											{num(verified)} / {num(total)} verified
										</span>
									</div>
									<div
										className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--pg-skeleton-highlight)"
										role="img"
										aria-label={`${share}% verified`}
									>
										<div
											className="h-full rounded-full bg-(--pg-status-success)"
											style={{ width: `${share}%` }}
										/>
									</div>
								</li>
							);
						})}
					</ul>
				</AdminSection>
			)}

			{canManage && (
				<AdminSection aria-labelledby="shortcuts-heading">
					<div className="sc_sectionHead">
						<h3 id="shortcuts-heading" className="sc_sectionTitle">
							Shortcuts
						</h3>
					</div>
					<div className="flex flex-wrap gap-3">
						<AppButton to={ROUTES.ADMIN_VERIFICATIONS} icon={<LuArrowRight />}>
							Review verifications
						</AppButton>
						<AppButton variant="secondary" to={ROUTES.ADMIN_PLANS}>
							Manage plans
						</AppButton>
						<AppButton variant="secondary" to={ROUTES.ADMIN_SUBSCRIPTIONS}>
							Grant a subscription
						</AppButton>
					</div>
				</AdminSection>
			)}
		</>
	);
}

export default AdminHome;
