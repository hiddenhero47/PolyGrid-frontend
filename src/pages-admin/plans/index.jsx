import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	LuPlus,
	LuPencil,
	LuCheck,
	LuCloudOff,
	LuRotateCw,
	LuUsers,
} from 'react-icons/lu';
import PlanServices from '../../features/services/custom-hooks/plans';
import AdminPageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import EmptyState from '../../components/empty-state';
import StatusBadge from '../../components/status-badge';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { PLAN_TIER, SYSTEM_ROLE } from '../../utilities/app-const';
import { formatMoney, humanize } from '../../utilities/basic-functions';
import PlanFormModal from './elements/plan-form-modal';
import { TierCard } from './elements/index.style';

const TIERS = Object.values(PLAN_TIER);

const durationLabel = (days) => {
	if (days % 365 === 0) return days === 365 ? 'year' : `${days / 365} years`;
	if (days % 30 === 0) return days === 30 ? 'month' : `${days / 30} months`;
	return `${days} days`;
};

// frontend-plan §C — Plans manager. One plan per tier (free / pro /
// enterprise); only a super_admin can create or edit (planRoutes.ts).
// A business profile only appears publicly while its owner has an active
// subscription, and subscriptions need an active plan for their tier.
function AdminPlans() {
	const { user } = useSelector((state) => state.auth);
	const canEdit = user?.systemRole === SYSTEM_ROLE.SUPER_ADMIN;
	const modalRef = useRef(null);
	const [editing, setEditing] = useState({ tier: null, plan: null });

	const {
		data: plans = [],
		isPending,
		isError,
		refetch,
	} = PlanServices.getPlans({ includeInactive: true });
	const createPlan = PlanServices.createPlan();
	const updatePlan = PlanServices.updatePlan();

	const byTier = Object.fromEntries(plans.map((plan) => [plan.planTier, plan]));

	const open = (tier, plan = null) => {
		setEditing({ tier, plan });
		modalRef.current.open();
	};

	const handleSubmit = (body) => {
		const done = (message) => () => {
			modalRef.current.close();
			toast.success(message);
		};
		if (editing.plan) {
			updatePlan.mutate(
				{ id: editing.plan._id, ...body },
				{ onSuccess: done('Plan updated') }
			);
		} else {
			createPlan.mutate(body, {
				onSuccess: done(`${humanize(editing.tier)} plan created`),
			});
		}
	};

	return (
		<>
			<AdminPageHeader
				eyebrow="Billing"
				title="Plans"
				subtitle="One plan per tier. Business profiles only show publicly while their owner has an active subscription to one of these."
			/>

			{!canEdit && (
				<p className="mb-6 rounded-xl bg-(--pg-status-infoSoft) px-4 py-3 text-[15px] text-(--pg-text-primary)">
					Only a super admin can create or change plans.
				</p>
			)}

			{isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load plans"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
					role="alert"
				/>
			) : (
				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{TIERS.map((tier) => {
						const plan = byTier[tier];

						if (isPending) {
							return (
								<TierCard key={tier}>
									<SkeletonBar $width="30%" />
									<SkeletonBar $width="60%" style={{ height: 22 }} />
									<SkeletonBar $width="45%" style={{ height: 38 }} />
									<SkeletonBar $width="80%" />
								</TierCard>
							);
						}

						if (!plan) {
							return (
								<TierCard key={tier} data-empty="true">
									<EmptyState
										compact
										eyebrow={`${humanize(tier)} tier`}
										title="No plan yet"
										text="Nobody can subscribe to this tier until it has a plan."
										actions={
											canEdit && (
												<AppButton icon={<LuPlus />} onClick={() => open(tier)}>
													Create plan
												</AppButton>
											)
										}
									/>
								</TierCard>
							);
						}

						return (
							<TierCard
								key={tier}
								$featured={tier === PLAN_TIER.PRO && plan.isActive}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="sc_tier">{humanize(tier)} tier</p>
										<h3 className="sc_name">{plan.name}</h3>
									</div>
									<StatusBadge
										label={plan.isActive ? 'Active' : 'Inactive'}
										tone={plan.isActive ? 'success' : 'neutral'}
									/>
								</div>
								<p className="sc_price">
									{plan.price === 0
										? 'Free'
										: formatMoney(plan.price, plan.currency)}
									<small>/ {durationLabel(plan.duration)}</small>
								</p>
								{plan.maxUsers != null && (
									<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
										<LuUsers aria-hidden="true" /> Up to {plan.maxUsers} team
										member{plan.maxUsers === 1 ? '' : 's'}
									</p>
								)}
								<ul className="sc_privileges">
									{plan.privileges?.length ? (
										plan.privileges.map((privilege) => (
											<li key={privilege}>
												<LuCheck aria-hidden="true" /> {privilege}
											</li>
										))
									) : (
										<li>No privileges listed.</li>
									)}
								</ul>
								{canEdit && (
									<AppButton
										variant="secondary"
										icon={<LuPencil />}
										onClick={() => open(tier, plan)}
									>
										Edit plan
									</AppButton>
								)}
							</TierCard>
						);
					})}
				</div>
			)}

			{canEdit && (
				<PlanFormModal
					refName={modalRef}
					tier={editing.tier}
					plan={editing.plan}
					onSubmit={handleSubmit}
					isPending={createPlan.isPending || updatePlan.isPending}
				/>
			)}
		</>
	);
}

export default AdminPlans;
