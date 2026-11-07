import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { LuArrowUpRight, LuRotateCw } from 'react-icons/lu';
import AccountServices from '../../../features/services/custom-hooks/account';
import { NO_STRIPE_CONNECT_COUNTRIES } from '../../../utilities/app-const';
import StatusBadge from '../../../components/status-badge';
import { AppButton } from '../../../components/button';
import SettingsCard from './settings-card';

const COMING_BACK = {
	return: 'Thanks. Stripe can take a moment to check your details.',
	refresh: 'That Stripe link expired. Continue when you’re ready.',
};

// Stripe Connect: providers, sellers and creators can be paid through
// Stripe instead of a manual bank transfer. POST /me/connect/onboard hands
// back Stripe's hosted form; Stripe sends them to /connect/return or
// /connect/refresh, which land here as ?connect=. Stripe tells the backend
// the result by webhook, so the user is re-read on arrival. Hidden until the
// user has a country, and for countries Stripe can't serve: they're paid by
// manual bank transfer.
function ConnectSection() {
	const { user } = useSelector((state) => state.auth);
	const [params] = useSearchParams();
	const back = COMING_BACK[params.get('connect')];
	const onboard = AccountServices.startConnect();
	const sync = AccountServices.syncUser();
	const { onboarded, payoutsEnabled } = user?.stripeConnect || {};

	if (!user?.country || NO_STRIPE_CONNECT_COUNTRIES.includes(user.country)) {
		return null;
	}

	const status = payoutsEnabled
		? { label: 'Ready', tone: 'success' }
		: onboarded
			? { label: 'Not finished', tone: 'warning' }
			: { label: 'Not set up', tone: 'neutral' };

	return (
		<SettingsCard
			id="connect-settings"
			title="Stripe payouts"
			description="Get paid through Stripe instead of a manual bank transfer. Stripe checks your identity and bank details on its own secure form."
		>
			<div
				ref={(el) => back && el?.scrollIntoView({ block: 'center' })}
				className="flex flex-col items-start gap-4"
			>
				<StatusBadge label={status.label} tone={status.tone} />
				{back && !payoutsEnabled && (
					<p role="status" className="text-sm text-(--pg-text-primary)">
						{back}
					</p>
				)}
				<p className="text-sm text-(--pg-text-secondary)">
					{payoutsEnabled
						? 'You’re all set. New payouts go to your Stripe account, and PolyGrid releases them from there to your bank.'
						: onboarded
							? 'Stripe still needs something from you, or is checking what you sent.'
							: 'Until this is done, payouts go by manual bank transfer to your payout account.'}
				</p>
				<div className="flex flex-wrap gap-3">
					<AppButton
						icon={<LuArrowUpRight />}
						variant={payoutsEnabled ? 'secondary' : 'primary'}
						disabled={onboard.isPending}
						onClick={() => onboard.mutate()}
					>
						{onboard.isPending
							? 'Opening Stripe…'
							: payoutsEnabled
								? 'Update details on Stripe'
								: onboarded
									? 'Continue on Stripe'
									: 'Set up on Stripe'}
					</AppButton>
					{onboarded && !payoutsEnabled && (
						<AppButton
							variant="secondary"
							icon={<LuRotateCw />}
							disabled={sync.isFetching}
							onClick={() => sync.refetch()}
						>
							Check status
						</AppButton>
					)}
				</div>
			</div>
		</SettingsCard>
	);
}

export default ConnectSection;
