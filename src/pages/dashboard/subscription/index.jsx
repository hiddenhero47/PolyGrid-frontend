import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
	LuCheck,
	LuCreditCard,
	LuCalendarClock,
	LuLoaderCircle,
} from 'react-icons/lu';
import SubscriptionServices from '../../../features/services/custom-hooks/subscriptions';
import PlanServices from '../../../features/services/custom-hooks/plans';
import PaymentServices, {
	refreshSubscription,
} from '../../../features/services/custom-hooks/payments';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../layouts/toast/toast-handler';
import CustomTable from '../../../components/table/custom-table';
import StatusBadge from '../../../components/status-badge';
import EmptyState from '../../../components/empty-state';
import ConfirmModal from '../../../components/modal/confirm-modal';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import { TierCard } from '../../admin/plans/elements/index.style';
import { AdminSection as Section } from '../../admin/elements/index.style';
import {
	formatDate,
	formatMoney,
	humanize,
} from '../../../utilities/basic-functions';
import CheckoutModal from '../../../components/checkout-modal';

const SUBSCRIPTION_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	active: { label: 'Active', tone: 'success' },
	past_due: { label: 'Past due', tone: 'error' },
	canceled: { label: 'Ended', tone: 'neutral' },
	expired: { label: 'Expired', tone: 'neutral' },
};

const PAYMENT_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	success: { label: 'Paid', tone: 'success' },
	failed: { label: 'Failed', tone: 'error' },
	refunded: { label: 'Refunded', tone: 'info' },
	cancelled: { label: 'Cancelled', tone: 'neutral' },
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
		Cell: ({ value }) => (
			<StatusBadge status={value} map={SUBSCRIPTION_BADGES} />
		),
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

const PAYMENT_FIELDS = [
	{
		Header: 'Date',
		accessor: 'createdAt',
		Cell: ({ value }) => formatDate(value, true),
	},
	{
		Header: 'For',
		accessor: 'targetType',
		Cell: ({ value }) => humanize(value),
	},
	{
		Header: 'Amount',
		accessor: 'amount',
		Cell: ({ value, row }) =>
			value === 0 ? 'Free' : formatMoney(value, row.original.currency),
	},
	{
		Header: 'Via',
		accessor: 'provider',
		Cell: ({ value }) => (value === 'manual' ? 'PolyGrid' : humanize(value)),
	},
	{
		Header: 'Status',
		accessor: 'status',
		Cell: ({ value }) => <StatusBadge status={value} map={PAYMENT_BADGES} />,
	},
];

const daysLeft = (date) =>
	Math.max(0, Math.ceil((new Date(date) - Date.now()) / 86400000));

// frontend-plan §B.5 — Subscription & Billing. A live subscription is what
// keeps verified business profiles in public search. Subscribing is
// POST /api/payments/intent: a free plan is active immediately; a paid
// one opens Stripe's card form and Stripe's webhook activates it, so the
// page polls the current plan until the new subscription shows up.
function MySubscription() {
	const queryClient = useQueryClient();
	const checkoutRef = useRef(null);
	const confirmRef = useRef(null);
	const [checkout, setCheckout] = useState(null); // { plan, clientSecret, subscriptionId, paymentId }
	const [awaiting, setAwaiting] = useState(null); // subscriptionId waiting on the webhook

	const current = SubscriptionServices.getCurrentSubscription();
	const activation = SubscriptionServices.awaitActivation(
		awaiting,
		(subscription) => {
			setAwaiting(null);
			refreshSubscription(queryClient);
			toast.success(`${humanize(subscription.planTier)} plan is active`);
		}
	);
	const plans = PlanServices.getPlans();
	const history = SubscriptionServices.getMySubscriptions();
	const payments = PaymentServices.getMyPayments();
	const subscribe = PaymentServices.subscribe();
	const refresh = PaymentServices.refresh();

	// Ask Stripe directly about a pending payment (its webhook may never
	// have arrived) — POST /api/payments/:id/refresh.
	const checkStatus = (paymentId) =>
		refresh.mutate(paymentId, {
			onSuccess: (res) => {
				if (res.status === 'success') {
					setAwaiting(null);
					toast.success(
						res.subscription
							? `${humanize(res.subscription.planTier)} plan is active`
							: 'Payment confirmed'
					);
				} else if (res.status === 'failed') {
					setAwaiting(null);
					toast.error(
						'This payment didn’t go through — you weren’t charged for a plan.'
					);
				} else {
					toast.info(
						'Stripe is still processing this payment. Try again in a few minutes.'
					);
				}
			},
		});

	const paymentFields = [
		...PAYMENT_FIELDS,
		{
			Header: '',
			accessor: '_id',
			align: 'right',
			Cell: ({ row }) =>
				row.original.status === 'pending' &&
				row.original.provider === 'stripe' ? (
					<AppButton
						size="sm"
						variant="secondary"
						onClick={() => checkStatus(row.original._id)}
						disabled={refresh.isPending}
					>
						Check status
					</AppButton>
				) : null,
		},
	];
	const sub = current.data;
	const confirming = Boolean(awaiting);

	const choose = async (plan) => {
		if (sub) {
			const ok = await confirmRef.current.ask({
				title:
					sub.planTier === plan.planTier
						? `Renew ${humanize(plan.planTier)}?`
						: `Switch to ${humanize(plan.planTier)}?`,
				text: `Your current plan has ${daysLeft(sub.expiresAt)} days left — they carry over onto the new period.`,
				confirmLabel: plan.price === 0 ? 'Confirm' : 'Continue to payment',
			});
			if (!ok) return;
		}
		subscribe.mutate(
			{ planTier: plan.planTier },
			{
				onSuccess: (res) => {
					if (!res.requiresPayment) {
						toast.success(`${humanize(plan.planTier)} plan is active`);
						return;
					}
					setCheckout({
						plan,
						clientSecret: res.clientSecret,
						subscriptionId: res.subscriptionId,
						paymentId: res.paymentId,
					});
					checkoutRef.current.open();
				},
			}
		);
	};

	const paid = () => {
		setAwaiting(checkout.subscriptionId);
		checkoutRef.current.close();
	};

	const buttonLabel = (plan, isCurrent) => {
		if (
			subscribe.isPending &&
			subscribe.variables?.planTier === plan.planTier
		) {
			return 'Starting…';
		}
		if (isCurrent) return 'Renew';
		if (plan.price === 0) return 'Activate free plan';
		return `Subscribe · ${formatMoney(plan.price, plan.currency)}`;
	};

	return (
		<>
			<PageHeader
				eyebrow="Business"
				title="Subscription"
				subtitle="An active plan keeps your verified profiles listed in public search. Switching or renewing carries any unused days over."
			/>

			<Section aria-labelledby="current-heading">
				<div className="sc_sectionHead">
					<h3 id="current-heading" className="sc_sectionTitle">
						Current plan
					</h3>
				</div>
				{confirming && !activation.gaveUp && (
					<p
						role="status"
						className="mb-4 flex items-center gap-3 rounded-xl bg-(--pg-status-infoSoft) px-4 py-3 text-[15px] text-(--pg-text-primary)"
					>
						<LuLoaderCircle
							className="shrink-0 animate-spin text-(--pg-status-info)"
							aria-hidden="true"
						/>
						Payment received — confirming with Stripe. This usually takes a few
						seconds.
					</p>
				)}
				{confirming && activation.gaveUp && (
					<div
						role="status"
						className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-(--pg-status-warningSoft) px-4 py-3 text-[15px] text-(--pg-text-primary)"
					>
						<span className="min-w-0 flex-1">
							Your payment went through, but Stripe hasn’t confirmed it to us
							yet. Check now, or leave it — we re-check pending payments every
							15 minutes and your plan will show up here.
						</span>
						{checkout?.paymentId && (
							<AppButton
								size="sm"
								onClick={() => checkStatus(checkout.paymentId)}
								disabled={refresh.isPending}
							>
								{refresh.isPending ? 'Checking…' : 'Check payment status'}
							</AppButton>
						)}
						<AppButton
							size="sm"
							variant="secondary"
							onClick={() => {
								setAwaiting(null);
								refreshSubscription(queryClient);
							}}
						>
							OK
						</AppButton>
					</div>
				)}
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
								<LuCalendarClock aria-hidden="true" /> Ends{' '}
								{formatDate(sub.expiresAt)} · {daysLeft(sub.expiresAt)} days
								left
							</p>
						</div>
						<StatusBadge status={sub.status} map={SUBSCRIPTION_BADGES} />
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
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="sc_tier">{humanize(plan.planTier)} tier</p>
										<h4 className="sc_name">{plan.name}</h4>
									</div>
									{isCurrent && (
										<StatusBadge label="Your plan" tone="success" />
									)}
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
									disabled={
										subscribe.isPending || (confirming && !activation.gaveUp)
									}
									onClick={() => choose(plan)}
								>
									{buttonLabel(plan, isCurrent)}
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

			<Section aria-labelledby="payments-heading">
				<div className="sc_sectionHead">
					<h3 id="payments-heading" className="sc_sectionTitle">
						Payments
					</h3>
				</div>
				<CustomTable
					ariaLabel="Payments"
					fields={paymentFields}
					dataSource={payments.data?.data || []}
					isLoading={payments.isPending}
					isError={payments.isError}
					refetch={payments.refetch}
					showPagination={false}
					loadingRows={2}
					emptyText="No payments yet"
				/>
			</Section>

			<CheckoutModal
				refName={checkoutRef}
				summary={
					checkout && {
						title: `${humanize(checkout.plan.planTier)} plan`,
						subtitle: `${formatMoney(checkout.plan.price, checkout.plan.currency)} for ${checkout.plan.duration} days. Any unused days on your current plan carry over.`,
						amount: checkout.plan.price,
						currency: checkout.plan.currency,
					}
				}
				clientSecret={checkout?.clientSecret}
				onPaid={paid}
			/>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

export default MySubscription;
