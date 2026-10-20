import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuX, LuCreditCard, LuMail, LuTriangleAlert } from 'react-icons/lu';
import SubscriptionServices from '../../../../features/services/custom-hooks/subscriptions';
import PlanServices from '../../../../features/services/custom-hooks/plans';
import { toast } from '../../../../layouts/toast/toast-handler';
import CustomTable from '../../../../components/table/custom-table';
import StatusBadge from '../../../../components/status-badge';
import ProfileAvatar from '../../../../components/profile-avatar';
import { AppButton } from '../../../../components/button';
import { CustomSelect } from '../../../../components/form-components';
import {
	formatDate,
	formatMoney,
	humanize,
} from '../../../../utilities/basic-functions';
import { ROUTES } from '../../../../utilities/app-routes';

const SUBSCRIPTION_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	active: { label: 'Active', tone: 'success' },
	past_due: { label: 'Past due', tone: 'error' },
	canceled: { label: 'Canceled', tone: 'neutral' },
	expired: { label: 'Expired', tone: 'neutral' },
};

const isLive = (sub) =>
	sub.status === 'active' && new Date(sub.expiresAt) > new Date();

const HISTORY_FIELDS = [
	{
		Header: 'Tier',
		accessor: 'planTier',
		Cell: ({ value }) => (
			<span className="font-semibold">{humanize(value)}</span>
		),
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
		Header: 'Expires',
		accessor: 'expiresAt',
		Cell: ({ value }) => formatDate(value),
	},
	{
		Header: 'Paid via',
		accessor: 'paymentProviderId',
		Cell: ({ value }) => value || 'Manual grant',
	},
];

// The chosen user: who they are, their subscription history, and the
// grant form (POST /api/subscriptions { userId, planTier }).
function GrantPanel({ userId, user, onClose }) {
	const history = SubscriptionServices.getUserSubscriptions({ userId });
	const plans = PlanServices.getPlans();
	const grant = SubscriptionServices.grantSubscription();

	const activePlans = (plans.data || []).filter((plan) => plan.isActive);
	const options = activePlans.map((plan) => ({
		value: plan.planTier,
		label: `${humanize(plan.planTier)} — ${plan.name} · ${
			plan.price === 0 ? 'Free' : formatMoney(plan.price, plan.currency)
		} / ${plan.duration} days`,
	}));
	const current = (history.data?.data || []).find(isLive);

	const form = useFormik({
		initialValues: { planTier: '' },
		validationSchema: yup.object({
			planTier: yup.string().required('Choose a plan'),
		}),
		onSubmit: ({ planTier }, { resetForm }) =>
			grant.mutate(
				{ userId, planTier },
				{
					onSuccess: () => {
						resetForm();
						toast.success(
							`${humanize(planTier)} plan granted${user?.fullName ? ` to ${user.fullName}` : ''}`
						);
					},
				}
			),
	});

	return (
		<section
			aria-labelledby="grant-heading"
			className="mb-8 rounded-[18px] border border-(--pg-accent-default) bg-(--pg-surface-background) p-5 md:p-6"
		>
			<div className="flex items-start gap-4">
				<ProfileAvatar
					avatar={user?.avatar}
					name={user?.fullName || '?'}
					size={52}
				/>
				<div className="min-w-0 flex-1">
					<p className="font-label text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-highlight) uppercase">
						Selected user
					</p>
					<h3
						id="grant-heading"
						className="mt-1 truncate text-lg font-semibold text-(--pg-text-primary)"
					>
						{user?.fullName || `User ${userId}`}
					</h3>
					{user?.email && (
						<p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-(--pg-text-secondary)">
							<LuMail aria-hidden="true" /> {user.email}
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="rounded-lg p-2 text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-text-primary)"
				>
					<LuX aria-hidden="true" />
				</button>
			</div>

			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start"
			>
				<div className="flex-1">
					<CustomSelect
						name="planTier"
						label="Plan to grant"
						placeholder={
							plans.isPending
								? 'Loading plans…'
								: options.length
									? 'Choose a plan'
									: 'No active plans'
						}
						options={options}
						disabled={!options.length}
						value={form.values.planTier}
						handleChange={(name) => (value) => form.setFieldValue(name, value)}
						onBlur={form.handleBlur}
						isError={(form.touched.planTier && form.errors.planTier) || false}
						errormessage={form.errors.planTier}
						hint={
							current
								? `Replaces their current ${humanize(current.planTier)} plan (until ${formatDate(current.expiresAt)}).`
								: 'Starts today. Recorded as a manual payment.'
						}
					/>
				</div>
				<div className="lg:pt-[30px]">
					<AppButton
						type="submit"
						icon={<LuCreditCard />}
						disabled={grant.isPending || !options.length}
					>
						{grant.isPending ? 'Granting…' : 'Grant plan'}
					</AppButton>
				</div>
			</form>

			{!plans.isPending && !options.length && (
				<p className="mt-3 inline-flex items-center gap-2 text-sm text-(--pg-status-warning)">
					<LuTriangleAlert aria-hidden="true" /> No active plans — create one on
					the{' '}
					<Link to={ROUTES.ADMIN_PLANS} className="font-semibold underline">
						Plans page
					</Link>
					.
				</p>
			)}

			<h4 className="font-label mt-8 mb-3 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
				Subscription history
			</h4>
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
				emptySbText="Granting a plan creates the first one."
			/>
		</section>
	);
}

GrantPanel.propTypes = {
	userId: PropTypes.string.isRequired,
	user: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};

export default GrantPanel;
