import React from 'react';
import { LuCheck, LuCreditCard, LuCalendarClock } from 'react-icons/lu';
import SubscriptionServices from '../../../features/services/custom-hooks/subscriptions';
import PlanServices from '../../../features/services/custom-hooks/plans';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import CustomTable from '../../../components/table/custom-table';
import StatusBadge from '../../../components/status-badge';
import EmptyState from '../../../components/empty-state';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import { TierCard } from '../../admin/plans/elements/index.style';
import { AdminSection as Section } from '../../admin/elements/index.style';
import {
	formatDate,
	formatMoney,
	humanize,
} from '../../../utilities/basic-functions';

const BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	active: { label: 'Active', tone: 'success' },
	past_due: { label: 'Past due', tone: 'error' },
	canceled: { label: 'Ended', tone: 'neutral' },
	expired: { label: 'Expired', tone: 'neutral' },
};

const HISTORY_FIELDS = [
	{
		Header: 'Plan',
		accessor: 'planTier',
		Cell: ({ value }) => humanize(value),
	},
	{
		Header: 'Status',
		accessor: 'status',
		Cell: ({ value }) => <StatusBadge status={value} map={BADGES} />,
	},
	{
		Header: 'Started',
		accessor: 'periodStarted',
		Cell: ({ value }) => formatDate(value),
	},
	{
		Header: 'Ends',
		accessor: 'expiresAt',
		Cell: ({ value }) => formatDate(value),
	},
];

const daysLeft = (date) =>
	Math.max(0, Math.ceil((new Date(date) - Date.now()) / 86400000));

// frontend-plan §B.5 — Subscription & Billing. A live subscription is what
// keeps verified business profiles in public search. Online checkout
// (Stripe, POST /api/payments/intent) comes with the payments slice; until
// then plans are granted by the PolyGrid team.
function MySubscription() {
	const current = SubscriptionServices.getCurrentSubscription();
	const plans = PlanServices.getPlans();
	const history = SubscriptionServices.getMySubscriptions();
	const sub = current.data;

	return (
		<>
			<PageHeader
				eyebrow="Business"
				title="Subscription"
				subtitle="An active plan keeps your verified profiles listed in public search."
			/>

			<Section aria-labelledby="current-heading">
				<div className="sc_sectionHead">
					<h3 id="current-heading" className="sc_sectionTitle">
						Current plan
					</h3>
				</div>
				{current.isPending ? (
					<SkeletonBar $width="40%" style={{ height: 80 }} />
				) : sub ? (
					<div className="flex flex-wrap items-center gap-5 rounded-[18px] border border-(--pg-accent-default) bg-(--pg-surface-background) p-5">
						<span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-(--pg-icon-accentBackground) text-xl text-(--pg-icon-accentColor)">
							<LuCreditCard aria-hidden="true" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="font-display text-2xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase">
								{humanize(sub.planTier)} plan
							</p>
							<p className="mt-1 inline-flex items-center gap-1.5 text-[15px] text-(--pg-text-secondary)">
								<LuCalendarClock aria-hidden="true" /> Renews or ends{' '}
								{formatDate(sub.expiresAt)} · {daysLeft(sub.expiresAt)} days
								left
							</p>
						</div>
						<StatusBadge status={sub.status} map={BADGES} />
					</div>
				) : (
					<EmptyState
						compact
						tone="accent"
						icon={<LuCreditCard />}
						title="No active plan"
						text="Your profiles can be set up and verified now; they go public once you’re on a plan."
					/>
				)}
			</Section>

			<Section aria-labelledby="plans-heading">
				<div className="sc_sectionHead">
					<h3 id="plans-heading" className="sc_sectionTitle">
						Plans
					</h3>
				</div>
				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{(plans.data || []).map((plan) => {
						const isCurrent = sub?.planTier === plan.planTier;
						return (
							<TierCard key={plan._id} $featured={isCurrent}>
								<div>
									<p className="sc_tier">{humanize(plan.planTier)} tier</p>
									<h4 className="sc_name">{plan.name}</h4>
								</div>
								<p className="sc_price">
									{plan.price === 0
										? 'Free'
										: formatMoney(plan.price, plan.currency)}
									<small>/ {plan.duration} days</small>
								</p>
								<ul className="sc_privileges">
									{(plan.privileges || []).map((p) => (
										<li key={p}>
											<LuCheck aria-hidden="true" /> {p}
										</li>
									))}
								</ul>
								<AppButton
									variant={isCurrent ? 'secondary' : 'primary'}
									disabled
								>
									{isCurrent ? 'Your plan' : 'Online checkout soon'}
								</AppButton>
							</TierCard>
						);
					})}
				</div>
				{!plans.isPending && !plans.data?.length && (
					<p className="text-[15px] text-(--pg-text-secondary)">
						No plans are available yet.
					</p>
				)}
			</Section>

			<Section aria-labelledby="history-heading">
				<div className="sc_sectionHead">
					<h3 id="history-heading" className="sc_sectionTitle">
						History
					</h3>
				</div>
				<CustomTable
					ariaLabel="Subscription history"
					fields={HISTORY_FIELDS}
					dataSource={history.data?.data || []}
					isLoading={history.isPending}
					isError={history.isError}
					refetch={history.refetch}
					showPagination={false}
					loadingRows={2}
					emptyText="No subscriptions yet"
				/>
			</Section>
		</>
	);
}

export default MySubscription;
