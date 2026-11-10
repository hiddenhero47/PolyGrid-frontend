import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	LuCircleCheck,
	LuCircleX,
	LuHourglass,
	LuShieldCheck,
	LuRotateCw,
	LuCloudOff,
} from 'react-icons/lu';
import { axiosCall } from '../../features/services/index-client';
import { refreshSubscription } from '../../features/services/custom-hooks/payments';
import { jobKey } from '../../features/services/custom-hooks/jobs';
import { PURCHASES_KEY } from '../../features/services/custom-hooks/purchases';
import EmptyState from '../../components/empty-state';
import AppLoader from '../../components/loader';
import { AppButton } from '../../components/button';
import { ROUTES } from '../../utilities/app-routes';
import { formatMoney } from '../../utilities/basic-functions';

// Where each kind of payment leads back to, and what it unlocked.
const KINDS = {
	job: {
		to: (id) => `${ROUTES.DASHBOARD_JOBS}/${id}`,
		back: 'Back to the job',
		done: (amount) => `${amount} is in escrow.`,
		unlocks: 'the money reaches escrow',
	},
	purchase: {
		to: () => ROUTES.DASHBOARD_PURCHASES,
		back: 'Go to Purchases',
		done: () => 'Your files are ready in Purchases.',
		unlocks: 'your files unlock',
	},
	subscription: {
		to: () => ROUTES.DASHBOARD_SUBSCRIPTION,
		back: 'Go to Subscription',
		done: () => 'Your plan is active.',
		unlocks: 'your plan starts',
	},
};

// Paystack's checkout is its own page: after paying, the buyer lands here
// (`/dashboard/payments/return/:kind/:id?`, the callbackPath we sent) with
// ?reference=polygrid_payment_<paymentId>. We ask the backend to check the
// payment with Paystack now (POST /api/payments/:id/refresh — the same
// call the Stripe pages make) rather than wait for the webhook.
function PaymentReturn() {
	const { kind: kindParam, id } = useParams();
	const [params] = useSearchParams();
	const queryClient = useQueryClient();
	const kind = KINDS[kindParam] || KINDS.job;
	const to = KINDS[kindParam] && (kindParam !== 'job' || id) ? kind.to(id) : ROUTES.DASHBOARD;
	const reference = params.get('reference') || params.get('trxref') || '';
	const paymentId = reference.replace(/^polygrid_payment_/, '');

	const check = useQuery({
		queryKey: ['payment-return', paymentId],
		enabled: Boolean(paymentId),
		retry: false,
		staleTime: Infinity,
		queryFn: async () => {
			const res = await axiosCall({
				url: `/api/payments/${paymentId}/refresh`,
				method: 'POST',
				silent: true,
			});
			refreshSubscription(queryClient);
			queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
			if (kindParam === 'job' && id)
				queryClient.invalidateQueries({ queryKey: jobKey(id) });
			return res;
		},
	});

	const backButton = (
		<AppButton to={to} variant="secondary">
			{kind.back}
		</AppButton>
	);

	if (!paymentId)
		return (
			<EmptyState
				tone="error"
				icon={<LuCloudOff />}
				title="We couldn’t tell which payment this was"
				text="If you paid, it shows up in your payments within a few minutes."
				actions={
					<>
						<AppButton to={ROUTES.DASHBOARD_SUBSCRIPTION}>Your payments</AppButton>
						{backButton}
					</>
				}
			/>
		);

	if (check.isPending) return <AppLoader fullPage showLabel />;

	if (check.isError)
		return (
			<EmptyState
				tone="error"
				icon={<LuCloudOff />}
				title="Couldn’t check your payment"
				text="Nothing is charged twice. Try again in a moment."
				actions={
					<>
						<AppButton icon={<LuRotateCw />} onClick={() => check.refetch()}>
							Check again
						</AppButton>
						{backButton}
					</>
				}
				role="alert"
			/>
		);

	const payment = check.data?.payment || {};
	const status = payment.status || check.data?.status;
	const amount = formatMoney(payment.amount, payment.currency);

	if (payment.isOnHold || status === 'disputed')
		return (
			<EmptyState
				tone="accent"
				icon={<LuShieldCheck />}
				title="Payment received"
				text={
					status === 'disputed'
						? `Your ${amount} payment is in dispute with your bank, so ${kind.unlocks} only once that’s settled.`
						: `We’ve received your ${amount} payment. ${kind.unlocks[0].toUpperCase()}${kind.unlocks.slice(1)} after a routine security check. We’ll email you when it clears.`
				}
				actions={<AppButton to={to}>{kind.back}</AppButton>}
			/>
		);

	if (status === 'success')
		return (
			<EmptyState
				tone="success"
				icon={<LuCircleCheck />}
				title="Payment complete"
				text={`Thanks — ${amount} paid. ${kind.done(amount)}`}
				actions={<AppButton to={to}>{kind.back}</AppButton>}
			/>
		);

	if (status === 'pending')
		return (
			<EmptyState
				tone="neutral"
				icon={<LuHourglass />}
				title="Still confirming your payment"
				text="Paystack hasn’t confirmed it yet. This usually takes a moment. If you closed the payment page before paying, nothing was charged."
				actions={
					<>
						<AppButton
							icon={<LuRotateCw />}
							onClick={() => check.refetch()}
							disabled={check.isFetching}
						>
							{check.isFetching ? 'Checking…' : 'Check again'}
						</AppButton>
						{backButton}
					</>
				}
			/>
		);

	return (
		<EmptyState
			tone="error"
			icon={<LuCircleX />}
			title="The payment didn’t go through"
			text="Nothing was charged. You can try again."
			actions={<AppButton to={to}>{kind.back}</AppButton>}
		/>
	);
}

export default PaymentReturn;
